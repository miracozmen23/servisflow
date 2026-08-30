import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { SESSION_COOKIE_NAME } from '../src/auth/auth.constants';
import {
  ServiceEventType,
  ServiceRequestStatus,
  UserRole,
  WarrantyStatus,
} from '../src/generated/prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  addCalendarMonths,
  getIstanbulBusinessDate,
} from '../src/service-requests/warranty-policy';

interface CreatedRequestData {
  closedAt: string | null;
  id: string;
  rmaNumber: string;
  status: string;
  warrantyStatus: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readCreatedRequest(body: unknown): CreatedRequestData {
  if (!isRecord(body) || !isRecord(body.data)) {
    throw new Error('Expected a service request response body.');
  }

  const { data } = body;

  if (
    typeof data.id !== 'string' ||
    typeof data.rmaNumber !== 'string' ||
    typeof data.status !== 'string' ||
    typeof data.warrantyStatus !== 'string' ||
    (data.closedAt !== null && typeof data.closedAt !== 'string')
  ) {
    throw new Error('Service request response fields are invalid.');
  }

  return {
    id: data.id,
    rmaNumber: data.rmaNumber,
    status: data.status,
    warrantyStatus: data.warrantyStatus,
    closedAt: data.closedAt,
  };
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function addCalendarDays(dateValue: string, days: number): string {
  const date = new Date(`${dateValue}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

describe('Service request creation (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let customerId: string;
  let technicianId: string;
  let customerCookie: string;
  let technicianCookie: string;
  let initialSequence: { value: number } | null;

  const runId = randomUUID();
  const businessDate = getIstanbulBusinessDate();
  const rmaYear = Number(businessDate.slice(0, 4));
  const approvedPurchaseDate = addCalendarMonths(businessDate, -12);
  const rejectedPurchaseDate = addCalendarMonths(businessDate, -36);
  const futurePurchaseDate = addCalendarDays(businessDate, 1);

  const requestBody = (suffix: string, purchaseDate: string) => ({
    brand: 'Lenovo',
    model: 'ThinkPad E14',
    serialNumber: `SERIAL-${runId}-${suffix}`,
    invoiceNumber: `INVOICE-${runId}-${suffix}`,
    purchaseDate,
    problemDescription: 'Cihaz açılış sırasında kendiliğinden kapanıyor.',
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    initialSequence = await prisma.rmaSequence.findUnique({
      where: { year: rmaYear },
      select: { value: true },
    });

    const passwordHash = await hash('ServiceRequestTest!42', 4);
    const [customer, technician] = await Promise.all([
      prisma.user.create({
        data: {
          email: `service-customer-${runId}@servisflow.test`,
          passwordHash,
          firstName: 'Service',
          lastName: 'Customer',
          role: UserRole.CUSTOMER,
        },
      }),
      prisma.user.create({
        data: {
          email: `service-technician-${runId}@servisflow.test`,
          passwordHash,
          firstName: 'Service',
          lastName: 'Technician',
          role: UserRole.TECHNICIAN,
        },
      }),
    ]);
    customerId = customer.id;
    technicianId = technician.id;

    const customerToken = randomBytes(32).toString('base64url');
    const technicianToken = randomBytes(32).toString('base64url');
    await prisma.session.createMany({
      data: [
        {
          userId: customerId,
          tokenHash: hashToken(customerToken),
          expiresAt: new Date(Date.now() + 60 * 60 * 1_000),
        },
        {
          userId: technicianId,
          tokenHash: hashToken(technicianToken),
          expiresAt: new Date(Date.now() + 60 * 60 * 1_000),
        },
      ],
    });
    customerCookie = `${SESSION_COOKIE_NAME}=${customerToken}`;
    technicianCookie = `${SESSION_COOKIE_NAME}=${technicianToken}`;
  });

  it('rejects an unauthenticated request', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/service-requests')
      .send(requestBody('unauthenticated', approvedPurchaseDate));

    expect(response.status).toBe(401);
    expect(response.body as unknown).toMatchObject({
      statusCode: 401,
      code: 'AUTHENTICATION_REQUIRED',
    });
  });

  it('rejects a technician', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/service-requests')
      .set('Cookie', technicianCookie)
      .send(requestBody('technician', approvedPurchaseDate));

    expect(response.status).toBe(403);
    expect(response.body as unknown).toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  });

  it('rejects client-controlled ownership and status fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/service-requests')
      .set('Cookie', customerCookie)
      .send({
        ...requestBody('injected', approvedPurchaseDate),
        customerId: technicianId,
        status: ServiceRequestStatus.CLOSED,
      });

    expect(response.status).toBe(400);
    expect(response.body as unknown).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
  });

  it('requires a date-only purchase date', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/service-requests')
      .set('Cookie', customerCookie)
      .send(requestBody('date-time', `${businessDate}T00:00:00.000Z`));

    expect(response.status).toBe(400);
    expect(response.body as unknown).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
  });

  it('rejects a future purchase date', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/service-requests')
      .set('Cookie', customerCookie)
      .send(requestBody('future', futurePurchaseDate));

    expect(response.status).toBe(400);
    expect(response.body as unknown).toEqual({
      statusCode: 400,
      code: 'PURCHASE_DATE_IN_FUTURE',
      message: 'Satın alma tarihi gelecekte olamaz.',
    });
  });

  it('creates an approved request and its initial audit event', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/service-requests')
      .set('Cookie', customerCookie)
      .send(requestBody('approved', approvedPurchaseDate));

    expect(response.status).toBe(201);
    const created = readCreatedRequest(response.body as unknown);
    expect(created.rmaNumber).toMatch(new RegExp(`^RMA-${rmaYear}-\\d{6}$`));
    expect(created.warrantyStatus).toBe(WarrantyStatus.APPROVED);
    expect(created.status).toBe(ServiceRequestStatus.WARRANTY_APPROVED);
    expect(created.closedAt).toBeNull();

    const persisted = await prisma.serviceRequest.findUniqueOrThrow({
      where: { id: created.id },
      include: { events: true },
    });
    expect(persisted.customerId).toBe(customerId);
    expect(persisted.events).toHaveLength(1);
    expect(persisted.events[0]).toMatchObject({
      actorId: customerId,
      type: ServiceEventType.REQUEST_CREATED,
      newStatus: ServiceRequestStatus.WARRANTY_APPROVED,
    });
  });

  it('closes a warranty-rejected request and records its event', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/service-requests')
      .set('Cookie', customerCookie)
      .send(requestBody('rejected', rejectedPurchaseDate));

    expect(response.status).toBe(201);
    const created = readCreatedRequest(response.body as unknown);
    expect(created.warrantyStatus).toBe(WarrantyStatus.REJECTED);
    expect(created.status).toBe(ServiceRequestStatus.WARRANTY_REJECTED);
    expect(created.closedAt).not.toBeNull();

    const event = await prisma.serviceEvent.findFirstOrThrow({
      where: { requestId: created.id },
    });
    expect(event).toMatchObject({
      actorId: customerId,
      type: ServiceEventType.REQUEST_CREATED,
      newStatus: ServiceRequestStatus.WARRANTY_REJECTED,
    });
    expect(event.customerMessage).toContain('garanti kapsamı dışında');
  });

  it('creates unique RMA numbers under concurrent requests', async () => {
    const responses = await Promise.all(
      Array.from({ length: 12 }, (_, index) =>
        request(app.getHttpServer())
          .post('/api/service-requests')
          .set('Cookie', customerCookie)
          .send(requestBody(`concurrent-${index}`, approvedPurchaseDate)),
      ),
    );

    expect(responses.every((response) => response.status === 201)).toBe(true);
    const createdRequests = responses.map((response) =>
      readCreatedRequest(response.body as unknown),
    );
    const rmaNumbers = createdRequests.map((item) => item.rmaNumber);
    expect(new Set(rmaNumbers).size).toBe(createdRequests.length);
    expect(
      rmaNumbers.every((rmaNumber) =>
        new RegExp(`^RMA-${rmaYear}-\\d{6}$`).test(rmaNumber),
      ),
    ).toBe(true);

    const requestIds = createdRequests.map((item) => item.id);
    await expect(
      prisma.serviceEvent.count({
        where: {
          requestId: { in: requestIds },
          type: ServiceEventType.REQUEST_CREATED,
        },
      }),
    ).resolves.toBe(createdRequests.length);
  });

  it('rolls back the sequence when its yearly capacity is exceeded', async () => {
    const sequenceBeforeTest = await prisma.rmaSequence.findUniqueOrThrow({
      where: { year: rmaYear },
      select: { value: true },
    });
    const exhaustedSerial = `SERIAL-${runId}-exhausted`;

    await prisma.rmaSequence.update({
      where: { year: rmaYear },
      data: { value: 999_999 },
    });

    try {
      const response = await request(app.getHttpServer())
        .post('/api/service-requests')
        .set('Cookie', customerCookie)
        .send({
          ...requestBody('exhausted', approvedPurchaseDate),
          serialNumber: exhaustedSerial,
        });

      expect(response.status).toBe(503);
      expect(response.body as unknown).toEqual({
        statusCode: 503,
        code: 'RMA_SEQUENCE_EXHAUSTED',
        message: 'Bu yıl için RMA numarası kapasitesi doldu.',
      });
      await expect(
        prisma.rmaSequence.findUniqueOrThrow({ where: { year: rmaYear } }),
      ).resolves.toMatchObject({ value: 999_999 });
      await expect(
        prisma.serviceRequest.findFirst({
          where: { serialNumber: exhaustedSerial },
        }),
      ).resolves.toBeNull();
    } finally {
      await prisma.rmaSequence.update({
        where: { year: rmaYear },
        data: { value: sequenceBeforeTest.value },
      });
    }
  });

  afterAll(async () => {
    if (prisma !== undefined) {
      if (customerId !== undefined) {
        await prisma.serviceRequest.deleteMany({ where: { customerId } });
      }

      const userIds = [customerId, technicianId].filter(
        (value): value is string => value !== undefined,
      );
      if (userIds.length > 0) {
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
      }

      if (initialSequence === null) {
        await prisma.rmaSequence.deleteMany({ where: { year: rmaYear } });
      } else {
        await prisma.rmaSequence.update({
          where: { year: rmaYear },
          data: { value: initialSequence.value },
        });
      }
    }

    if (app !== undefined) {
      await app.close();
    }
  });
});
