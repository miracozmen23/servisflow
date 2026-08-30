import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface HealthResponse {
  data: {
    status: 'ok';
    database: 'up';
    timestamp: string;
  };
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<HealthResponse> {
    await this.prisma.checkConnection();

    return {
      data: {
        status: 'ok',
        database: 'up',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
