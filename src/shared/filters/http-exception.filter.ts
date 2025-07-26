import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
@Catch()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly messages: MessageService) {}
  private readonly logger = new Logger(AllExceptionsFilter.name);

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

    const translated = this.messages.get(`exceptions.${message}`, {
      lang: request.headers['accept-language'] || 'en',
      args: (exception as any)?.response?.args || {},
    });

    this.logger.warn(`[${request.method}] ${request.url} → ${message}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: translated,
    });
  }
}
