import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let checkConnection: jest.MockedFunction<PrismaService['checkConnection']>;

  beforeEach(async () => {
    checkConnection = jest.fn<Promise<void>, []>();
    checkConnection.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: { checkConnection },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('reports that the API and database are healthy', async () => {
    const response = await controller.check();

    expect(response.data).toMatchObject({
      status: 'ok',
      database: 'up',
    });
    expect(Number.isNaN(Date.parse(response.data.timestamp))).toBe(false);
    expect(checkConnection).toHaveBeenCalledTimes(1);
  });
});
