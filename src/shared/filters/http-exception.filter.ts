import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
import { TranslationKeys } from '../utils/translation-keys';
import { AppLogger } from '../services/app-logger.service';
import { I18nService } from 'nestjs-i18n';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    @Inject(MessageService) private readonly messageService: MessageService,
    @Inject(AppLogger) private readonly appLogger: AppLogger,
    @Inject(I18nService) private readonly i18n: I18nService,
  ) {}

  private mapExceptionToTranslationKey(
    exception: HttpException,
  ): TranslationKeys {
    const exceptionResponse = exception.getResponse();
    const errorMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message;

    switch (errorMessage) {
      case 'User Not Found':
        return TranslationKeys.EXCEPTION_USER_NOT_FOUND;
      case 'Invalid Credentials':
        return TranslationKeys.EXCEPTION_INVALID_CREDENTIALS;
      case 'Email Already Registered':
        return TranslationKeys.EXCEPTION_EMAIL_ALREADY_REGISTERED;
      case 'Token Expired':
        return TranslationKeys.EXCEPTION_TOKEN_EXPIRED;
      case 'Token Missing':
        return TranslationKeys.EXCEPTION_TOKEN_MISSING;
      case 'Token Revoked':
        return TranslationKeys.EXCEPTION_TOKEN_REVOKED;
      default:
        return TranslationKeys.EXCEPTION_INTERNAL_SERVER_ERROR;
    }
  }

  private getErrorDetails(exception: unknown): {
    status: number;
    message: string;
    errorCode?: string;
    stack?: string;
  } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return {
        status: exception.getStatus(),
        message:
          typeof response === 'string' ? response : (response as any).message,
        errorCode: (response as any)?.error || exception.name,
        stack:
          process.env.NODE_ENV !== 'production' ? exception.stack : undefined,
      };
    }

    const error = exception as Error;
    return {
      status: 500,
      message: error.message || 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    };
  }

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const lang = request.headers['accept-language'] || 'en';

    const { status, message, errorCode, stack } =
      this.getErrorDetails(exception);
    const translationKey =
      exception instanceof HttpException
        ? this.mapExceptionToTranslationKey(exception)
        : TranslationKeys.EXCEPTION_INTERNAL_SERVER_ERROR;

    // Loggeo estructurado
    this.appLogger.error(`Exception: ${message}`, {
      statusCode: status,
      path: request.url,
      method: request.method,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      errorCode,
      stack,
    });

    // Traducción del mensaje
    let translatedMessage: string;
    try {
      translatedMessage = await this.i18n.translate(translationKey, {
        lang,
        args: (exception as any)?.response?.args || {},
      });
    } catch (translationError) {
      this.logger.error('Translation failed', translationError);
      translatedMessage = message;
    }

    // Respuesta al cliente
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: translatedMessage,
      error: errorCode,
      ...(process.env.NODE_ENV === 'development' && { stack }),
    });
  }
}
