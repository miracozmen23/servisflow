import {
  ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

interface ExceptionBody {
  code?: unknown;
  message?: unknown;
}

interface ApiErrorResponse {
  statusCode: number;
  code: string;
  message: string;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionBody = exception.getResponse();
      const body = this.isExceptionBody(exceptionBody) ? exceptionBody : {};

      response.status(statusCode).json({
        statusCode,
        code:
          typeof body.code === 'string'
            ? body.code
            : (HttpStatus[statusCode] ?? 'HTTP_ERROR'),
        message:
          typeof body.message === 'string' ? body.message : 'İstek işlenemedi.',
      } satisfies ApiErrorResponse);
      return;
    }

    this.logger.error(
      'Unhandled request error',
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Beklenmeyen bir sunucu hatası oluştu.',
    } satisfies ApiErrorResponse);
  }

  private isExceptionBody(value: unknown): value is ExceptionBody {
    return typeof value === 'object' && value !== null;
  }
}
