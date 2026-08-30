import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { resolve } from 'node:path';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: resolve(__dirname, '../../../.env'),
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    AuthModule,
    HealthModule,
    ServiceRequestsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
