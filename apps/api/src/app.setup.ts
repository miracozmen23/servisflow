import {
  BadRequestException,
  type INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Express } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { SESSION_COOKIE_NAME } from './auth/auth.constants';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';

export function configureApp(app: INestApplication): void {
  const configService = app.get(ConfigService);

  if (configService.getOrThrow<string>('NODE_ENV') === 'production') {
    const expressApplication = app.getHttpAdapter().getInstance() as Express;
    expressApplication.set('trust proxy', 1);
  }

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: () =>
        new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Gönderilen alanlardan biri veya birkaçı geçersiz.',
        }),
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ServisFlow API')
    .setDescription('Warranty-aware RMA service request API.')
    .setVersion('0.1.0')
    .addCookieAuth(SESSION_COOKIE_NAME)
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument, {
    customSiteTitle: 'ServisFlow API Docs',
    useGlobalPrefix: true,
  });
}
