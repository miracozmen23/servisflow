import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { createHash, randomBytes, randomInt, randomUUID } from 'node:crypto';
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readDataRecord(body: unknown): Record<string, unknown> {
  if (!isRecord(body) || !isRecord(body.data)) {
    throw new Error('Expected an object in the response data field.');
  }

  return body.data;
}

function readDataArray(body: unknown): Array<Record<string, unknown>> {
  if (
    !isRecord(body) ||
    !Array.isArray(body.data) ||
    !body.data.every(isRecord)
  ) {
    throw new Error('Expected an array in the response data field.');
  }

  return body.data;
}

function readMeta(body: unknown): Record<string, unknown> {
  if (!isRecord(body) || !isRecord(body.meta)) {
    throw new Error('Expected pagination metadata.');
  }

  return body.meta;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

describe('Service request workflow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let customerAId: string;
  let customerBId: string;
  let technicianId: string;
  let customerACookie: string;
  let technicianCookie: string;
  let requestAApprovedId: string;
  let requestADiagnosisId: string;
  let requestAQualityControlId: string;
  let requestBApprovedId: string;

  const runId = randomUUID();
  const rmaBase = randomInt(100_000, 899_996);
  const customerAEmail = `workflow-a-${runId}@servisflow.test`;
  const customerBEmail = `workflow-b-${runId}@servisflow.test`;
  const technicianEmail = `workflow-tech-${runId}@servisflow.test`;
  const internalNote = `INTERNAL-${runId}-power-rail-measurement`;
  const customerStatusMessage = `Cihaz kabul edildi ${runId}`;

  const rmaNumber = (offset: number): string =>
    `RMA-2099-${String(rmaBase + offset).padStart(6, '0')}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    const passwordHash = await hash('WorkflowTestPassword!42', 4);
    const [customerA, customerB, technician] = await Promise.all([
      prisma.user.create({
        data: {
          email: customerAEmail,
          passwordHash,
          firstName: 'Workflow',
          lastName: 'Customer A',
          role: UserRole.CUSTOMER,
        },
      }),
      prisma.user.create({
        data: {
          email: customerBEmail,
          passwordHash,
          firstName: 'Workflow',
          lastName: 'Customer B',
          role: UserRole.CUSTOMER,
        },
      }),
      prisma.user.create({
        data: {
          email: technicianEmail,
          passwordHash,
          firstName: 'Workflow',
          lastName: 'Technician',
          role: UserRole.TECHNICIAN,
        },
      }),
    ]);
    customerAId = customerA.id;
    customerBId = customerB.id;
    technicianId = technician.id;

    const customerAToken = randomBytes(32).toString('base64url');
    const technicianToken = randomBytes(32).toString('base64url');
    await prisma.session.createMany({
      data: [
        {
          userId: customerAId,
          tokenHash: hashToken(customerAToken),
          expiresAt: new Date(Date.now() + 60 * 60 * 1_000),
        },
        {
          userId: technicianId,
          tokenHash: hashToken(technicianToken),
          expiresAt: new Date(Date.now() + 60 * 60 * 1_000),
        },
      ],
    });
    customerACookie = `${SESSION_COOKIE_NAME}=${customerAToken}`;
    technicianCookie = `${SESSION_COOKIE_NAME}=${technicianToken}`;

    const createRequest = (
      customerId: string,
      offset: number,
      status: ServiceRequestStatus,
      serialLabel: string,
    ) =>
      prisma.serviceRequest.create({
        data: {
          rmaNumber: rmaNumber(offset),
          customerId,
          brand: 'Lenovo',
          model: 'ThinkPad E14',
          serialNumber: `${serialLabel}-${runId}`,
          invoiceNumber: `WF-INV-${offset}-${runId}`,
          purchaseDate: new Date('2025-01-15T00:00:00.000Z'),
          warrantyExpiresAt: new Date('2027-01-15T00:00:00.000Z'),
          warrantyStatus: WarrantyStatus.APPROVED,
          status,
          problemDescription: 'Workflow testi için oluşturulan servis talebi.',
          createdAt: new Date(Date.now() - offset * 1_000),
          events: {
            create: {
              actorId: customerId,
              type: ServiceEventType.REQUEST_CREATED,
              newStatus: status,
              customerMessage: 'Servis talebi oluşturuldu.',
            },
          },
        },
      });

    const [requestAApproved, requestADiagnosis, requestAQuality, requestB] =
      await Promise.all([
        createRequest(
          customerAId,
          1,
          ServiceRequestStatus.WARRANTY_APPROVED,
          'WF-A-SEARCH',
        ),
        createRequest(
          customerAId,
          2,
          ServiceRequestStatus.DIAGNOSIS,
          'WF-A-DIAGNOSIS',
        ),
        createRequest(
          customerAId,
          3,
          ServiceRequestStatus.QUALITY_CONTROL,
          'WF-A-QUALITY',
        ),
        createRequest(
          customerBId,
          4,
          ServiceRequestStatus.WARRANTY_APPROVED,
          'WF-B-SEARCH',
        ),
      ]);
    requestAApprovedId = requestAApproved.id;
    requestADiagnosisId = requestADiagnosis.id;
    requestAQualityControlId = requestAQuality.id;
    requestBApprovedId = requestB.id;
  });

  it('scopes customer pagination to owned requests', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/service-requests')
      .query({ page: 1, limit: 2 })
      .set('Cookie', customerACookie);

    expect(response.status).toBe(200);
    const data = readDataArray(response.body as unknown);
    const meta = readMeta(response.body as unknown);
    expect(data).toHaveLength(2);
    expect(meta).toEqual({ page: 1, limit: 2, total: 3 });
    expect(data.every((item) => !('customer' in item))).toBe(true);
    expect(JSON.stringify(response.body)).not.toContain(customerBEmail);

    const secondPage = await request(app.getHttpServer())
      .get('/api/service-requests')
      .query({ page: 2, limit: 2 })
      .set('Cookie', customerACookie);
    expect(readDataArray(secondPage.body as unknown)).toHaveLength(1);
  });

  it('lets technicians filter and search all requests', async () => {
    const allResponse = await request(app.getHttpServer())
      .get('/api/service-requests')
      .query({ search: runId })
      .set('Cookie', technicianCookie);
    expect(allResponse.status).toBe(200);
    expect(readMeta(allResponse.body as unknown)).toMatchObject({ total: 4 });
    expect(
      readDataArray(allResponse.body as unknown).every(
        (item) => isRecord(item.customer) && 'email' in item.customer,
      ),
    ).toBe(true);

    const rmaSearchResponse = await request(app.getHttpServer())
      .get('/api/service-requests')
      .query({ search: rmaNumber(4).toLowerCase() })
      .set('Cookie', technicianCookie);
    expect(readMeta(rmaSearchResponse.body as unknown)).toMatchObject({
      total: 1,
    });

    const serialSearchResponse = await request(app.getHttpServer())
      .get('/api/service-requests')
      .query({ search: 'wf-a-search' })
      .set('Cookie', technicianCookie);
    expect(readMeta(serialSearchResponse.body as unknown)).toMatchObject({
      total: 1,
    });

    const statusResponse = await request(app.getHttpServer())
      .get('/api/service-requests')
      .query({
        status: ServiceRequestStatus.DIAGNOSIS,
        search: runId,
      })
      .set('Cookie', technicianCookie);
    expect(readMeta(statusResponse.body as unknown)).toMatchObject({
      total: 1,
    });

    await request(app.getHttpServer())
      .get('/api/service-requests')
      .query({ limit: 51 })
      .set('Cookie', technicianCookie)
      .expect(400);
  });

  it('hides another customer request as not found', async () => {
    const customerResponse = await request(app.getHttpServer())
      .get(`/api/service-requests/${requestBApprovedId}`)
      .set('Cookie', customerACookie);
    expect(customerResponse.status).toBe(404);
    expect(customerResponse.body as unknown).toMatchObject({
      code: 'SERVICE_REQUEST_NOT_FOUND',
    });

    const technicianResponse = await request(app.getHttpServer())
      .get(`/api/service-requests/${requestBApprovedId}`)
      .set('Cookie', technicianCookie);
    expect(technicianResponse.status).toBe(200);
    expect(readDataRecord(technicianResponse.body as unknown).customer).toEqual(
      expect.objectContaining({ email: customerBEmail }),
    );
  });

  it('prevents customers from changing status or adding notes', async () => {
    await request(app.getHttpServer())
      .patch(`/api/service-requests/${requestAApprovedId}/status`)
      .set('Cookie', customerACookie)
      .send({ status: ServiceRequestStatus.DEVICE_RECEIVED })
      .expect(403);

    await request(app.getHttpServer())
      .post(`/api/service-requests/${requestAApprovedId}/notes`)
      .set('Cookie', customerACookie)
      .send({ content: internalNote })
      .expect(403);
  });

  it('keeps technician notes out of every customer projection', async () => {
    const noteResponse = await request(app.getHttpServer())
      .post(`/api/service-requests/${requestAApprovedId}/notes`)
      .set('Cookie', technicianCookie)
      .send({ content: `  ${internalNote}  ` });
    expect(noteResponse.status).toBe(201);
    expect(readDataRecord(noteResponse.body as unknown)).toMatchObject({
      requestId: requestAApprovedId,
      content: internalNote,
    });

    const technicianDetail = await request(app.getHttpServer())
      .get(`/api/service-requests/${requestAApprovedId}`)
      .set('Cookie', technicianCookie);
    const technicianBody = readDataRecord(technicianDetail.body as unknown);
    expect(JSON.stringify(technicianBody)).toContain(internalNote);
    expect(JSON.stringify(technicianBody)).toContain(
      ServiceEventType.NOTE_ADDED,
    );

    const customerDetail = await request(app.getHttpServer())
      .get(`/api/service-requests/${requestAApprovedId}`)
      .set('Cookie', customerACookie);
    const customerBody = readDataRecord(customerDetail.body as unknown);
    expect(customerBody).not.toHaveProperty('notes');
    expect(customerBody).not.toHaveProperty('customer');
    expect(JSON.stringify(customerBody)).not.toContain(internalNote);
    expect(JSON.stringify(customerBody)).not.toContain(technicianEmail);
    expect(JSON.stringify(customerBody)).not.toContain(
      ServiceEventType.NOTE_ADDED,
    );
    expect(
      Array.isArray(customerBody.timeline) &&
        customerBody.timeline.every(
          (event) => isRecord(event) && !('actor' in event),
        ),
    ).toBe(true);
  });

  it('rejects skipped transitions and early resolution summaries', async () => {
    const skippedResponse = await request(app.getHttpServer())
      .patch(`/api/service-requests/${requestAApprovedId}/status`)
      .set('Cookie', technicianCookie)
      .send({ status: ServiceRequestStatus.DIAGNOSIS });
    expect(skippedResponse.status).toBe(400);
    expect(skippedResponse.body as unknown).toMatchObject({
      code: 'INVALID_STATUS_TRANSITION',
    });

    const summaryResponse = await request(app.getHttpServer())
      .patch(`/api/service-requests/${requestAApprovedId}/status`)
      .set('Cookie', technicianCookie)
      .send({
        status: ServiceRequestStatus.DEVICE_RECEIVED,
        resolutionSummary: 'Bu özet henüz gönderilmemelidir.',
      });
    expect(summaryResponse.status).toBe(400);
    expect(summaryResponse.body as unknown).toMatchObject({
      code: 'RESOLUTION_SUMMARY_NOT_ALLOWED',
    });
  });

  it('allows only one concurrent transition and creates one event', async () => {
    const transition = () =>
      request(app.getHttpServer())
        .patch(`/api/service-requests/${requestAApprovedId}/status`)
        .set('Cookie', technicianCookie)
        .send({
          status: ServiceRequestStatus.DEVICE_RECEIVED,
          customerMessage: customerStatusMessage,
        });
    const responses = await Promise.all([transition(), transition()]);
    const statuses = responses.map((response) => response.status).sort();

    expect(statuses).toEqual([200, 409]);
    expect(
      responses.some(
        (response) =>
          isRecord(response.body) &&
          response.body.code === 'STATUS_CHANGED_CONCURRENTLY',
      ),
    ).toBe(true);
    await expect(
      prisma.serviceEvent.count({
        where: {
          requestId: requestAApprovedId,
          type: ServiceEventType.STATUS_CHANGED,
          oldStatus: ServiceRequestStatus.WARRANTY_APPROVED,
          newStatus: ServiceRequestStatus.DEVICE_RECEIVED,
        },
      }),
    ).resolves.toBe(1);
  });

  it('shares a technician status message with the customer timeline', async () => {
    const transitionResponse = await request(app.getHttpServer())
      .patch(`/api/service-requests/${requestAApprovedId}/status`)
      .set('Cookie', technicianCookie)
      .send({
        status: ServiceRequestStatus.DIAGNOSIS,
        customerMessage: 'Cihazın teknik teşhisine başlandı.',
      });
    expect(transitionResponse.status).toBe(200);

    const customerDetail = await request(app.getHttpServer())
      .get(`/api/service-requests/${requestAApprovedId}`)
      .set('Cookie', customerACookie);
    expect(JSON.stringify(customerDetail.body)).toContain(
      'Cihazın teknik teşhisine başlandı.',
    );
  });

  it('requires a resolution, closes NOT_REPAIRABLE, and locks the terminal state', async () => {
    const missingSummary = await request(app.getHttpServer())
      .patch(`/api/service-requests/${requestADiagnosisId}/status`)
      .set('Cookie', technicianCookie)
      .send({ status: ServiceRequestStatus.NOT_REPAIRABLE });
    expect(missingSummary.status).toBe(400);
    expect(missingSummary.body as unknown).toMatchObject({
      code: 'RESOLUTION_SUMMARY_REQUIRED',
    });

    const resolutionSummary =
      'Ana kart fiziksel hasarı nedeniyle cihaz güvenli biçimde onarılamıyor.';
    const terminalResponse = await request(app.getHttpServer())
      .patch(`/api/service-requests/${requestADiagnosisId}/status`)
      .set('Cookie', technicianCookie)
      .send({
        status: ServiceRequestStatus.NOT_REPAIRABLE,
        resolutionSummary,
      });
    expect(terminalResponse.status).toBe(200);
    expect(readDataRecord(terminalResponse.body as unknown)).toMatchObject({
      status: ServiceRequestStatus.NOT_REPAIRABLE,
      resolutionSummary,
    });
    expect(
      readDataRecord(terminalResponse.body as unknown).closedAt,
    ).not.toBeNull();

    const lockedResponse = await request(app.getHttpServer())
      .patch(`/api/service-requests/${requestADiagnosisId}/status`)
      .set('Cookie', technicianCookie)
      .send({ status: ServiceRequestStatus.REPAIR });
    expect(lockedResponse.status).toBe(400);
    expect(lockedResponse.body as unknown).toMatchObject({
      code: 'INVALID_STATUS_TRANSITION',
    });

    await request(app.getHttpServer())
      .post(`/api/service-requests/${requestADiagnosisId}/notes`)
      .set('Cookie', technicianCookie)
      .send({ content: 'Terminal durum sonrası dahili doğrulama notu.' })
      .expect(201);
  });

  it('requires a resolution and closes a quality-controlled request', async () => {
    await request(app.getHttpServer())
      .patch(`/api/service-requests/${requestAQualityControlId}/status`)
      .set('Cookie', technicianCookie)
      .send({ status: ServiceRequestStatus.CLOSED })
      .expect(400);

    const resolutionSummary =
      'Güç devresi onarıldı ve kalite kontrol testleri başarıyla tamamlandı.';
    const response = await request(app.getHttpServer())
      .patch(`/api/service-requests/${requestAQualityControlId}/status`)
      .set('Cookie', technicianCookie)
      .send({
        status: ServiceRequestStatus.CLOSED,
        resolutionSummary,
        customerMessage: 'Onarım tamamlandı.',
      });

    expect(response.status).toBe(200);
    expect(readDataRecord(response.body as unknown)).toMatchObject({
      status: ServiceRequestStatus.CLOSED,
      resolutionSummary,
    });
    expect(readDataRecord(response.body as unknown).closedAt).not.toBeNull();
  });

  afterAll(async () => {
    if (prisma !== undefined) {
      const customerIds = [customerAId, customerBId].filter(
        (value): value is string => value !== undefined,
      );
      if (customerIds.length > 0) {
        await prisma.serviceRequest.deleteMany({
          where: { customerId: { in: customerIds } },
        });
      }

      const userIds = [customerAId, customerBId, technicianId].filter(
        (value): value is string => value !== undefined,
      );
      if (userIds.length > 0) {
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
      }
    }

    if (app !== undefined) {
      await app.close();
    }
  });
});
