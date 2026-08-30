import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash, hashSync } from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { UserRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  BCRYPT_COST,
  BCRYPT_MAX_PASSWORD_BYTES,
  SESSION_TTL_MS,
} from './auth.constants';
import type { AuthResult, AuthUser } from './auth.types';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

const AUTH_USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
} as const;

interface SessionCredentials {
  expiresAt: Date;
  sessionToken: string;
  tokenHash: string;
}

@Injectable()
export class AuthService {
  private readonly dummyPasswordHash = hashSync(
    'servisflow-invalid-login-comparison',
    BCRYPT_COST,
  );

  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    this.ensurePasswordFitsBcrypt(dto.password);

    const email = dto.email.trim().toLowerCase();
    const passwordHash = await hash(dto.password, BCRYPT_COST);
    const session = this.createSessionCredentials();

    try {
      const user = await this.prisma.$transaction(async (transaction) => {
        const createdUser = await transaction.user.create({
          data: {
            email,
            passwordHash,
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            role: UserRole.CUSTOMER,
          },
          select: AUTH_USER_SELECT,
        });

        await transaction.session.create({
          data: {
            userId: createdUser.id,
            tokenHash: session.tokenHash,
            expiresAt: session.expiresAt,
          },
        });

        return createdUser;
      });

      return {
        expiresAt: session.expiresAt,
        sessionToken: session.sessionToken,
        user,
      };
    } catch (error: unknown) {
      if (this.isEmailUniqueConstraintError(error)) {
        throw new ConflictException({
          code: 'EMAIL_ALREADY_IN_USE',
          message: 'Bu e-posta adresiyle daha önce kayıt oluşturulmuş.',
        });
      }

      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const email = dto.email.trim().toLowerCase();
    const passwordWithinLimit =
      Buffer.byteLength(dto.password, 'utf8') <= BCRYPT_MAX_PASSWORD_BYTES;
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        ...AUTH_USER_SELECT,
        passwordHash: true,
      },
    });
    const comparisonHash = user?.passwordHash ?? this.dummyPasswordHash;
    const comparisonPassword = passwordWithinLimit
      ? dto.password
      : 'servisflow-password-too-long';
    const passwordMatches = await compare(comparisonPassword, comparisonHash);

    if (user === null || !passwordWithinLimit || !passwordMatches) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'E-posta adresi veya şifre hatalı.',
      });
    }

    const session = this.createSessionCredentials();
    await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: session.tokenHash,
        expiresAt: session.expiresAt,
      },
    });

    return {
      expiresAt: session.expiresAt,
      sessionToken: session.sessionToken,
      user: this.toAuthUser(user),
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  private createSessionCredentials(): SessionCredentials {
    const sessionToken = randomBytes(32).toString('base64url');

    return {
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      sessionToken,
      tokenHash: createHash('sha256').update(sessionToken).digest('hex'),
    };
  }

  private ensurePasswordFitsBcrypt(password: string): void {
    if (Buffer.byteLength(password, 'utf8') > BCRYPT_MAX_PASSWORD_BYTES) {
      throw new BadRequestException({
        code: 'PASSWORD_TOO_LONG',
        message: 'Şifre UTF-8 biçiminde en fazla 72 bayt olabilir.',
      });
    }
  }

  private isEmailUniqueConstraintError(error: unknown): boolean {
    if (
      typeof error !== 'object' ||
      error === null ||
      !('code' in error) ||
      error.code !== 'P2002' ||
      !('message' in error) ||
      typeof error.message !== 'string'
    ) {
      return false;
    }

    return error.message.includes('User_email_key');
  }

  private toAuthUser(user: AuthUser & { passwordHash: string }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
