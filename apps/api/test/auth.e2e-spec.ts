import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { SESSION_COOKIE_NAME } from '../src/auth/auth.constants';
import { UserRole } from '../src/generated/prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';

const TEST_PASSWORD = 'ValidPassword!42';
const WRONG_PASSWORD = 'WrongPassword!42';

function getSetCookieHeaders(headers: Record<string, unknown>): string[] {
  const value = headers['set-cookie'];

  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === 'string')
  ) {
    throw new Error('Expected at least one Set-Cookie header.');
  }

  return value;
}

function getCookiePair(setCookieHeader: string): string {
  const [cookiePair] = setCookieHeader.split(';');

  if (cookiePair === undefined) {
    throw new Error('Expected a cookie pair.');
  }

  return cookiePair;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

describe('Authentication (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let registeredUserId: string;
  let registrationCookie: string;
  let loginCookie: string;

  const runId = randomUUID();
  const normalizedEmail = `auth-${runId}@servisflow.test`;
  const submittedEmail = `  AUTH-${runId}@ServisFlow.Test  `;
  const rejectedRoleEmail = `role-${runId}@servisflow.test`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  it('rejects a role supplied to public registration', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: rejectedRoleEmail,
        password: TEST_PASSWORD,
        firstName: 'Role',
        lastName: 'Injection',
        role: UserRole.TECHNICIAN,
      });

    expect(response.status).toBe(400);
    expect(response.body as unknown).toEqual({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Gönderilen alanlardan biri veya birkaçı geçersiz.',
    });
    await expect(
      prisma.user.findUnique({ where: { email: rejectedRoleEmail } }),
    ).resolves.toBeNull();
  });

  it('registers a normalized CUSTOMER and starts a secure session', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: submittedEmail,
        password: TEST_PASSWORD,
        firstName: '  Ayşe  ',
        lastName: '  Yılmaz  ',
      });

    expect(response.status).toBe(201);
    expect(response.body as unknown).toMatchObject({
      data: {
        email: normalizedEmail,
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
        role: UserRole.CUSTOMER,
      },
    });
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');

    const setCookieHeaders = getSetCookieHeaders(response.headers);
    const sessionCookieHeader = setCookieHeaders.find((header) =>
      header.startsWith(`${SESSION_COOKIE_NAME}=`),
    );

    expect(sessionCookieHeader).toBeDefined();
    expect(sessionCookieHeader).toContain('HttpOnly');
    expect(sessionCookieHeader).toContain('Path=/api');
    expect(sessionCookieHeader).toContain('SameSite=Lax');
    registrationCookie = getCookiePair(sessionCookieHeader ?? '');

    const databaseUser = await prisma.user.findUniqueOrThrow({
      where: { email: normalizedEmail },
    });
    registeredUserId = databaseUser.id;

    expect(databaseUser.role).toBe(UserRole.CUSTOMER);
    expect(databaseUser.passwordHash).not.toBe(TEST_PASSWORD);
  });

  it('rejects a duplicate normalized email', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: normalizedEmail.toUpperCase(),
        password: TEST_PASSWORD,
        firstName: 'Other',
        lastName: 'Customer',
      });

    expect(response.status).toBe(409);
    expect(response.body as unknown).toEqual({
      statusCode: 409,
      code: 'EMAIL_ALREADY_IN_USE',
      message: 'Bu e-posta adresiyle daha önce kayıt oluşturulmuş.',
    });
  });

  it('logs in and creates an additional session', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: submittedEmail,
        password: TEST_PASSWORD,
      });

    expect(response.status).toBe(200);
    expect(response.body as unknown).toMatchObject({
      data: {
        id: registeredUserId,
        email: normalizedEmail,
        role: UserRole.CUSTOMER,
      },
    });

    const setCookieHeaders = getSetCookieHeaders(response.headers);
    const sessionCookieHeader = setCookieHeaders.find((header) =>
      header.startsWith(`${SESSION_COOKIE_NAME}=`),
    );
    loginCookie = getCookiePair(sessionCookieHeader ?? '');

    await expect(
      prisma.session.count({ where: { userId: registeredUserId } }),
    ).resolves.toBe(2);
  });

  it('uses the same error for an unknown email and a wrong password', async () => {
    const wrongPasswordResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: normalizedEmail,
        password: WRONG_PASSWORD,
      });
    const unknownEmailResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: `missing-${runId}@servisflow.test`,
        password: WRONG_PASSWORD,
      });
    const expectedError = {
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'E-posta adresi veya şifre hatalı.',
    };

    expect(wrongPasswordResponse.status).toBe(401);
    expect(unknownEmailResponse.status).toBe(401);
    expect(wrongPasswordResponse.body as unknown).toEqual(expectedError);
    expect(unknownEmailResponse.body as unknown).toEqual(expectedError);
  });

  it('returns the current user for a valid session', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', registrationCookie);

    expect(response.status).toBe(200);
    expect(response.body as unknown).toEqual({
      data: {
        id: registeredUserId,
        email: normalizedEmail,
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
        role: UserRole.CUSTOMER,
      },
    });
  });

  it('rejects expired and revoked sessions', async () => {
    const expiredToken = randomBytes(32).toString('base64url');
    const revokedToken = randomBytes(32).toString('base64url');

    await prisma.session.createMany({
      data: [
        {
          userId: registeredUserId,
          tokenHash: hashToken(expiredToken),
          expiresAt: new Date(Date.now() - 60_000),
        },
        {
          userId: registeredUserId,
          tokenHash: hashToken(revokedToken),
          expiresAt: new Date(Date.now() + 60_000),
          revokedAt: new Date(),
        },
      ],
    });

    for (const token of [expiredToken, revokedToken]) {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', `${SESSION_COOKIE_NAME}=${token}`);

      expect(response.status).toBe(401);
      expect(response.body as unknown).toEqual({
        statusCode: 401,
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Oturum geçersiz veya süresi dolmuş.',
      });
    }
  });

  it('revokes only the current session on logout', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Cookie', loginCookie);

    expect(response.status).toBe(200);
    expect(response.body as unknown).toEqual({ data: { success: true } });

    const loginToken = loginCookie.slice(`${SESSION_COOKIE_NAME}=`.length);
    const loggedOutSession = await prisma.session.findUniqueOrThrow({
      where: { tokenHash: hashToken(loginToken) },
    });
    expect(loggedOutSession.revokedAt).not.toBeNull();

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', loginCookie)
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', registrationCookie)
      .expect(200);
  });

  it('rate limits repeated login attempts', async () => {
    const fourthAttempt = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: `rate-4-${runId}@servisflow.test`,
        password: WRONG_PASSWORD,
      });
    const fifthAttempt = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: `rate-5-${runId}@servisflow.test`,
        password: WRONG_PASSWORD,
      });
    const sixthAttempt = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: `rate-6-${runId}@servisflow.test`,
        password: WRONG_PASSWORD,
      });

    expect(fourthAttempt.status).toBe(401);
    expect(fifthAttempt.status).toBe(401);
    expect(sixthAttempt.status).toBe(429);
    expect(sixthAttempt.body as unknown).toMatchObject({
      statusCode: 429,
      code: 'TOO_MANY_REQUESTS',
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { contains: runId },
      },
    });
    await app.close();
  });
});
