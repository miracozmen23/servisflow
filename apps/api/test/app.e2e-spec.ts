import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readServiceRequestParameters(
  body: unknown,
): Array<Record<string, unknown>> {
  if (!isRecord(body) || !isRecord(body.paths)) {
    throw new Error('Expected OpenAPI paths.');
  }

  const serviceRequestPath = body.paths['/api/service-requests'];
  if (!isRecord(serviceRequestPath) || !isRecord(serviceRequestPath.get)) {
    throw new Error('Expected the service-request GET operation.');
  }

  const { parameters } = serviceRequestPath.get;
  if (!Array.isArray(parameters) || !parameters.every(isRecord)) {
    throw new Error('Expected service-request query parameters.');
  }

  return parameters;
}

describe('HealthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((response) => {
        const body: unknown = response.body;

        expect(body).toMatchObject({
          data: {
            status: 'ok',
            database: 'up',
          },
        });
      });
  });

  it('/api/docs (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/docs')
      .expect(200)
      .expect('Content-Type', /html/);
  });

  it('/api/docs-json describes pagination parameters as numbers', () => {
    return request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200)
      .expect((response) => {
        const body: unknown = response.body;
        const parameters = readServiceRequestParameters(body);

        for (const name of ['page', 'limit']) {
          const parameter = parameters.find((item) => item.name === name);
          if (parameter === undefined || !isRecord(parameter.schema)) {
            throw new Error(`Expected the ${name} query parameter schema.`);
          }

          expect(parameter.schema.type).toBe('number');
        }
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
