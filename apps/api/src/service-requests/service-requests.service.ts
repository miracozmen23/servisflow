import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ServiceEventType,
  ServiceRequestStatus,
  WarrantyStatus,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateServiceRequestDto } from './dto/create-service-request.dto';
import {
  evaluateWarranty,
  getIstanbulBusinessDate,
  InvalidCalendarDateError,
} from './warranty-policy';

const MAX_RMA_SEQUENCE = 999_999;

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

interface RmaSequenceRow {
  value: number;
}

export interface ServiceRequestView {
  id: string;
  rmaNumber: string;
  customerId: string;
  brand: string;
  model: string;
  serialNumber: string;
  invoiceNumber: string;
  purchaseDate: Date;
  warrantyExpiresAt: Date;
  warrantyStatus: WarrantyStatus;
  status: ServiceRequestStatus;
  problemDescription: string;
  resolutionSummary: string | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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
}
