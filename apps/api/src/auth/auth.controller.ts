import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { CookieOptions, Response } from 'express';
import {
  AUTH_RATE_LIMIT,
  AUTH_RATE_LIMIT_WINDOW_MS,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from './auth.constants';
import { AuthService } from './auth.service';
import type { AuthenticatedRequest, AuthUser } from './auth.types';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionAuthGuard } from './guards/session-auth.guard';

interface AuthResponse {
  data: AuthUser;
}

interface LogoutResponse {
  data: {
    success: true;
  };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Throttle({
    default: {
      limit: AUTH_RATE_LIMIT,
      ttl: AUTH_RATE_LIMIT_WINDOW_MS,
    },
  })
  @ApiOperation({ summary: 'Register a customer and start a session' })
  @ApiCreatedResponse({ description: 'Customer registered.' })
  @ApiConflictResponse({ description: 'Email is already registered.' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.register(dto);
    this.setSessionCookie(response, result.sessionToken, result.expiresAt);

    return { data: result.user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: AUTH_RATE_LIMIT,
      ttl: AUTH_RATE_LIMIT_WINDOW_MS,
    },
  })
  @ApiOperation({ summary: 'Start a session' })
  @ApiOkResponse({ description: 'Session started.' })
  @ApiUnauthorizedResponse({ description: 'Credentials are invalid.' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.login(dto);
    this.setSessionCookie(response, result.sessionToken, result.expiresAt);

    return { data: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Revoke the current session' })
  @ApiOkResponse({ description: 'Current session revoked.' })
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LogoutResponse> {
    await this.authService.logout(request.auth.sessionId);
    response.clearCookie(SESSION_COOKIE_NAME, this.baseCookieOptions());

    return { data: { success: true } };
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get the current user' })
  @ApiOkResponse({ description: 'Current user returned.' })
  @ApiUnauthorizedResponse({ description: 'Session is invalid or expired.' })
  me(@CurrentUser() user: AuthUser): AuthResponse {
    return { data: user };
  }

  private setSessionCookie(
    response: Response,
    sessionToken: string,
    expiresAt: Date,
  ): void {
    response.cookie(SESSION_COOKIE_NAME, sessionToken, {
      ...this.baseCookieOptions(),
      expires: expiresAt,
      maxAge: SESSION_TTL_MS,
    });
  }

  private baseCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      path: '/api',
      sameSite: 'lax',
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    };
  }
}
