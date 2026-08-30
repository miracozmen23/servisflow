import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '../../generated/prisma/client';
import type { AuthenticatedRequest } from '../auth.types';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles === undefined || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.auth === undefined) {
      throw new UnauthorizedException({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Bu işlem için oturum açmalısınız.',
      });
    }

    if (!requiredRoles.includes(request.auth.user.role)) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Bu işlemi yapmaya yetkiniz bulunmuyor.',
      });
    }

    return true;
  }
}
