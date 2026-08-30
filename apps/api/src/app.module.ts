import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: resolve(__dirname, '../../../.env'),
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      isGlobal: true,
    }),
    HealthModule,
  ],
})
export class AppModule {}
