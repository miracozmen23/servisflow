import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { AuthUser } from '../auth/auth.types';
import {
  Prisma,
  ServiceEventType,
  ServiceRequestStatus,
  WarrantyStatus,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateServiceNoteDto } from './dto/create-service-note.dto';
import type { CreateServiceRequestDto } from './dto/create-service-request.dto';
import type { ListServiceRequestsQueryDto } from './dto/list-service-requests-query.dto';
import type { UpdateServiceRequestStatusDto } from './dto/update-service-request-status.dto';
import {
  isTechnician,
  presentCustomerDetail,
  presentTechnicianDetail,
  type ServiceNoteView,
  type ServiceRequestDetail,
  type ServiceRequestListItem,
  type ServiceRequestView,
} from './service-request.presenter';
import {
  canTransitionStatus,
  isTerminalStatus,
  requiresResolutionSummary,
} from './status-transition';
import {
  evaluateWarranty,
  getIstanbulBusinessDate,
  InvalidCalendarDateError,
} from './warranty-policy';

const MAX_RMA_SEQUENCE = 999_999;

const PERSON_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
} as const;

const SERVICE_REQUEST_SELECT = {
  id: true,
  rmaNumber: true,
  customerId: true,
  brand: true,
  model: true,
  serialNumber: true,
  invoiceNumber: true,
  purchaseDate: true,
  warrantyExpiresAt: true,
  warrantyStatus: true,
  status: true,
  problemDescription: true,
  resolutionSummary: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const SERVICE_REQUEST_LIST_SELECT = {
  id: true,
  rmaNumber: true,
  brand: true,
  model: true,
  serialNumber: true,
  warrantyStatus: true,
  status: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const PUBLIC_EVENT_SELECT = {
  id: true,
  type: true,
  oldStatus: true,
  newStatus: true,
  customerMessage: true,
  createdAt: true,
} as const;

const TECHNICIAN_EVENT_SELECT = {
  ...PUBLIC_EVENT_SELECT,
  actor: { select: PERSON_SELECT },
} as const;

const SERVICE_NOTE_SELECT = {
  id: true,
  requestId: true,
  content: true,
  createdAt: true,
  author: { select: PERSON_SELECT },
} as const;

interface RmaSequenceRow {
  value: number;
}

export interface ServiceRequestListResult {
  data: ServiceRequestListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

@Injectable()
export class ServiceRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    customerId: string,
    dto: CreateServiceRequestDto,
  ): Promise<ServiceRequestView> {
    const now = new Date();
    const businessDate = getIstanbulBusinessDate(now);
    let warranty: ReturnType<typeof evaluateWarranty>;

    try {
      warranty = evaluateWarranty(dto.purchaseDate, businessDate);
    } catch (error: unknown) {
      if (error instanceof InvalidCalendarDateError) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Satın alma tarihi geçerli bir takvim tarihi olmalıdır.',
        });
      }

      throw error;
    }

    if (warranty.isFuturePurchase) {
      throw new BadRequestException({
        code: 'PURCHASE_DATE_IN_FUTURE',
        message: 'Satın alma tarihi gelecekte olamaz.',
      });
    }

    const warrantyStatus = warranty.isWithinWarranty
      ? WarrantyStatus.APPROVED
      : WarrantyStatus.REJECTED;
    const status = warranty.isWithinWarranty
      ? ServiceRequestStatus.WARRANTY_APPROVED
      : ServiceRequestStatus.WARRANTY_REJECTED;
    const customerMessage = warranty.isWithinWarranty
      ? 'Garanti uygunluğu onaylandı ve servis talebi oluşturuldu.'
      : 'Garanti süresi sona erdiği için talep garanti kapsamı dışında kapatıldı.';
    const rmaYear = Number(businessDate.slice(0, 4));

    return this.prisma.$transaction(async (transaction) => {
      const sequenceRows = await transaction.$queryRaw<RmaSequenceRow[]>`
        INSERT INTO "RmaSequence" ("year", "value")
        VALUES (${rmaYear}, 1)
        ON CONFLICT ("year") DO UPDATE
        SET "value" = "RmaSequence"."value" + 1
        RETURNING "value"
      `;
      const sequenceValue = sequenceRows[0]?.value;

      if (sequenceValue === undefined || sequenceValue < 1) {
        throw new InternalServerErrorException({
          code: 'RMA_SEQUENCE_ERROR',
          message: 'RMA numarası üretilemedi.',
        });
      }

      if (sequenceValue > MAX_RMA_SEQUENCE) {
        throw new ServiceUnavailableException({
          code: 'RMA_SEQUENCE_EXHAUSTED',
          message: 'Bu yıl için RMA numarası kapasitesi doldu.',
        });
      }

      const rmaNumber = `RMA-${rmaYear}-${String(sequenceValue).padStart(6, '0')}`;
      const serviceRequest = await transaction.serviceRequest.create({
        data: {
          rmaNumber,
          customerId,
          brand: dto.brand.trim(),
          model: dto.model.trim(),
          serialNumber: dto.serialNumber.trim(),
          invoiceNumber: dto.invoiceNumber.trim(),
          purchaseDate: warranty.purchaseDate,
          warrantyExpiresAt: warranty.warrantyExpiresAt,
          warrantyStatus,
          status,
          problemDescription: dto.problemDescription.trim(),
          closedAt: warranty.isWithinWarranty ? null : now,
        },
        select: SERVICE_REQUEST_SELECT,
      });

      await transaction.serviceEvent.create({
        data: {
          requestId: serviceRequest.id,
          actorId: customerId,
          type: ServiceEventType.REQUEST_CREATED,
          newStatus: status,
          customerMessage,
        },
      });

      return serviceRequest;
    });
  }

  async list(
    user: AuthUser,
    query: ListServiceRequestsQueryDto,
  ): Promise<ServiceRequestListResult> {
    const where = this.buildListWhere(user, query);
    const skip = (query.page - 1) * query.limit;
    const orderBy = [{ createdAt: 'desc' as const }, { id: 'desc' as const }];

    if (isTechnician(user.role)) {
      const [records, total] = await this.prisma.$transaction([
        this.prisma.serviceRequest.findMany({
          where,
          select: {
            ...SERVICE_REQUEST_LIST_SELECT,
            customer: { select: PERSON_SELECT },
          },
          orderBy,
          skip,
          take: query.limit,
        }),
        this.prisma.serviceRequest.count({ where }),
      ]);

      return {
        data: records,
        meta: { page: query.page, limit: query.limit, total },
      };
    }

    const [records, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
        select: SERVICE_REQUEST_LIST_SELECT,
        orderBy,
        skip,
        take: query.limit,
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);

    return {
      data: records,
      meta: { page: query.page, limit: query.limit, total },
    };
  }

  async getDetail(
    user: AuthUser,
    requestId: string,
  ): Promise<ServiceRequestDetail> {
    if (isTechnician(user.role)) {
      const record = await this.prisma.serviceRequest.findUnique({
        where: { id: requestId },
        select: {
          ...SERVICE_REQUEST_SELECT,
          customer: { select: PERSON_SELECT },
          notes: {
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
            select: SERVICE_NOTE_SELECT,
          },
          events: {
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
            select: TECHNICIAN_EVENT_SELECT,
          },
        },
      });

      if (record === null) {
        throw this.requestNotFound();
      }

      return presentTechnicianDetail(record);
    }

    const record = await this.prisma.serviceRequest.findFirst({
      where: {
        id: requestId,
        customerId: user.id,
      },
      select: {
        ...SERVICE_REQUEST_SELECT,
        events: {
          where: { type: { not: ServiceEventType.NOTE_ADDED } },
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          select: PUBLIC_EVENT_SELECT,
        },
      },
    });

    if (record === null) {
      throw this.requestNotFound();
    }

    return presentCustomerDetail(record);
  }

  async updateStatus(
    actorId: string,
    requestId: string,
    dto: UpdateServiceRequestStatusDto,
  ): Promise<ServiceRequestView> {
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.serviceRequest.findUnique({
        where: { id: requestId },
        select: { status: true },
      });

      if (existing === null) {
        throw this.requestNotFound();
      }

      if (!canTransitionStatus(existing.status, dto.status)) {
        throw new BadRequestException({
          code: 'INVALID_STATUS_TRANSITION',
          message: 'Bu durum geçişine izin verilmiyor.',
        });
      }

      const resolutionSummary = dto.resolutionSummary?.trim();
      const needsResolution = requiresResolutionSummary(dto.status);

      if (needsResolution && resolutionSummary === undefined) {
        throw new BadRequestException({
          code: 'RESOLUTION_SUMMARY_REQUIRED',
          message: 'Bu durum için çözüm özeti zorunludur.',
        });
      }

      if (!needsResolution && resolutionSummary !== undefined) {
        throw new BadRequestException({
          code: 'RESOLUTION_SUMMARY_NOT_ALLOWED',
          message:
            'Çözüm özeti yalnız terminal teknik durumlarda gönderilebilir.',
        });
      }

      const now = new Date();
      const updateResult = await transaction.serviceRequest.updateMany({
        where: {
          id: requestId,
          status: existing.status,
        },
        data: {
          status: dto.status,
          resolutionSummary: resolutionSummary ?? null,
          closedAt: isTerminalStatus(dto.status) ? now : null,
        },
      });

      if (updateResult.count !== 1) {
        throw new ConflictException({
          code: 'STATUS_CHANGED_CONCURRENTLY',
          message: 'Talep durumu başka bir işlem tarafından güncellendi.',
        });
      }

      await transaction.serviceEvent.create({
        data: {
          requestId,
          actorId,
          type: ServiceEventType.STATUS_CHANGED,
          oldStatus: existing.status,
          newStatus: dto.status,
          customerMessage: dto.customerMessage?.trim(),
        },
      });

      return transaction.serviceRequest.findUniqueOrThrow({
        where: { id: requestId },
        select: SERVICE_REQUEST_SELECT,
      });
    });
  }

  async addNote(
    actorId: string,
    requestId: string,
    dto: CreateServiceNoteDto,
  ): Promise<ServiceNoteView> {
    return this.prisma.$transaction(async (transaction) => {
      const requestExists = await transaction.serviceRequest.findUnique({
        where: { id: requestId },
        select: { id: true },
      });

      if (requestExists === null) {
        throw this.requestNotFound();
      }

      const note = await transaction.serviceNote.create({
        data: {
          requestId,
          authorId: actorId,
          content: dto.content.trim(),
        },
        select: SERVICE_NOTE_SELECT,
      });

      await transaction.serviceEvent.create({
        data: {
          requestId,
          actorId,
          type: ServiceEventType.NOTE_ADDED,
        },
      });

      return note;
    });
  }

  private buildListWhere(
    user: AuthUser,
    query: ListServiceRequestsQueryDto,
  ): Prisma.ServiceRequestWhereInput {
    return {
      ...(isTechnician(user.role) ? {} : { customerId: user.id }),
      ...(query.status === undefined ? {} : { status: query.status }),
      ...(query.search === undefined
        ? {}
        : {
            OR: [
              {
                rmaNumber: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                serialNumber: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ],
          }),
    };
  }

  private requestNotFound(): NotFoundException {
    return new NotFoundException({
      code: 'SERVICE_REQUEST_NOT_FOUND',
      message: 'Servis talebi bulunamadı.',
    });
  }
}
