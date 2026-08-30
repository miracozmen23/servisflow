import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from './guards/roles.guard';
import { SessionAuthGuard } from './guards/session-auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, RolesGuard, SessionAuthGuard],
  exports: [AuthService, RolesGuard, SessionAuthGuard],
})
export class AuthModule {}
