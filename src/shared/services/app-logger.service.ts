import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AppLogger {
  private readonly logger = new Logger(AppLogger.name);
  private readonly logLevel = process.env.LOG_LEVEL || 'info';

  // Niveles de log compatibles con Winston
  private readonly levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    verbose: 4,
  };

  private shouldLog(level: string): boolean {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  logUserAttempt(message: string, context: Record<string, unknown> = {}) {
    if (!this.shouldLog('info')) return;

    this.logger.log({
      message,
      type: 'AUTH_ATTEMPT',
      level: 'info',
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  warnUser(message: string, error?: Error, context?: Record<string, unknown>) {
    this.logger.warn({
      message,
      type: 'USER_WARNING',
      level: 'warn',
      error: error ? this.serializeError(error) : undefined,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  logUserSuccess(message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog('info')) return;

    this.logger.log({
      message,
      type: 'USER_SUCCESS',
      level: 'info',
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  private serializeError(error: Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    };
  }

  // Nuevo método para HTTP requests
  logHttpRequest(request: Request, responseTime: number) {
    if (!this.shouldLog('info')) return;

    this.logger.log({
      type: 'HTTP_REQUEST',
      level: 'info',
      method: request.method,
      path: request.path,
      statusCode: request.statusCode,
      responseTime,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      timestamp: new Date().toISOString(),
    });
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
  if (!this.shouldLog('error')) return;

  this.logger.error({
    message,
    type: 'USER_ERROR',
    level: 'error',
    error: error ? this.serializeError(error) : undefined,
    timestamp: new Date().toISOString(),
    ...context,
  });
}

}
