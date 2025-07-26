import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
import { TranslationKeys } from '../utils/translation-keys';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly messages: MessageService) {}
  private readonly logger = new Logger(AllExceptionsFilter.name);

  private mapExceptionMessageKey(message: string): TranslationKeys {
    switch (message) {
      case 'User Not Found':
        return TranslationKeys.EXCEPTION_USER_NOT_FOUND;
      case 'Invalid Credentials':
        return TranslationKeys.EXCEPTION_INVALID_CREDENTIALS;
      case 'Email Already Registered':
        return TranslationKeys.EXCEPTION_EMAIL_ALREADY_REGISTERED;
      // agrega más casos según tus mensajes
      case 'Internal server error':
      default:
        return TranslationKeys.EXCEPTION_INTERNAL_SERVER_ERROR;
    }
  }

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseContent = exception.getResponse();
      message =
        typeof responseContent === 'string'
          ? responseContent
          : (responseContent as any).message || message;
    }

    const translationKey = this.mapExceptionMessageKey(message);

const translated = await this.messages.getTranslatedException(
  translationKey,
  request.headers['accept-language'] || 'en',
  (exception as any)?.response?.args || {},
);


    this.logger.warn(`[${request.method}] ${request.url} → ${message}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: translated,
    });
  }
}
