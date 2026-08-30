import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SESSION_COOKIE_NAME } from '../auth.constants';
import type { AuthenticatedRequest } from '../auth.types';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookies = request.cookies as Record<string, unknown> | undefined;
    const sessionToken = cookies?.[SESSION_COOKIE_NAME];

    if (
      typeof sessionToken !== 'string' ||
      !/^[A-Za-z0-9_-]{43}$/.test(sessionToken)
    ) {
      throw this.authenticationError();
    }

    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');
    const session = await this.prisma.session.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        expiresAt: true,
        revokedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (
      session === null ||
      session.revokedAt !== null ||
      session.expiresAt.getTime() <= Date.now()
    ) {
      throw this.authenticationError();
    }

    request.auth = {
      sessionId: session.id,
      user: session.user,
    };

    return true;
  }

  private authenticationError(): UnauthorizedException {
    return new UnauthorizedException({
      code: 'AUTHENTICATION_REQUIRED',
      message: 'Oturum geçersiz veya süresi dolmuş.',
    });
  }
}
