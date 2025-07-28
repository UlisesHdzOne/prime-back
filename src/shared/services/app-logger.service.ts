import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppLogger {
  private readonly logger = new Logger(AppLogger.name);
  private readonly logLevel = process.env.LOG_LEVEL || 'info';
  private readonly nodeEnv = process.env.NODE_ENV || 'development';

  private readonly levels = {
    emergency: 0, // System is unusable
    alert: 1, // Action must be taken immediately
    critical: 2, // Critical conditions
    error: 3, // Error conditions
    warn: 4, // Warning conditions
    notice: 5, // Normal but significant condition
    info: 6, // Informational messages
    debug: 7, // Debug-level messages
    trace: 8, // Trace-level messages
  };

  private shouldLog(level: keyof typeof this.levels): boolean {
    return (
      this.levels[level] <=
        this.levels[this.logLevel as keyof typeof this.levels] || false
    );
  }

  private generateCorrelationId(): string {
    return uuidv4();
  }

  private redactSensitiveData(data: any): any {
    if (typeof data !== 'object' || data === null) return data;

    const sensitiveKeys = [
      'password',
      'token',
      'authorization',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      'creditCard',
      'ssn',
    ];
    const redactedValue = '[REDACTED]';

    if (Array.isArray(data)) {
      return data.map((item) => this.redactSensitiveData(item));
    }

    return Object.keys(data).reduce(
      (acc, key) => {
        const value = data[key];
        acc[key] = sensitiveKeys.includes(key.toLowerCase())
          ? redactedValue
          : this.redactSensitiveData(value);
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  private serializeError(error: unknown) {
    if (!(error instanceof Error)) return { message: String(error) };

    return {
      name: error.name,
      message: error.message,
      stack: this.nodeEnv !== 'production' ? error.stack : undefined,
      ...(error['code'] && { code: (error as any).code }),
      ...(error['status'] && { status: (error as any).status }),
      ...(error['response'] && {
        response: this.redactSensitiveData((error as any).response),
      }),
    };
  }

  private createLogEntry(
    type: string,
    level: keyof typeof this.levels,
    message: string,
    context?: Record<string, unknown>,
    error?: unknown,
  ) {
    return {
      correlationId: this.generateCorrelationId(),
      type,
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: this.nodeEnv,
      ...(context ? this.redactSensitiveData(context) : {}),
      ...(error ? { error: this.serializeError(error) } : {}),
    };
  }

  // === Public API ===

  emergency(
    message: string,
    error?: unknown,
    context?: Record<string, unknown>,
  ) {
    this.logger.error(
      this.createLogEntry(
        'SYSTEM_EMERGENCY',
        'emergency',
        message,
        context,
        error,
      ),
    );
  }

  alert(message: string, error?: unknown, context?: Record<string, unknown>) {
    this.logger.error(
      this.createLogEntry('SYSTEM_ALERT', 'alert', message, context, error),
    );
  }

  critical(
    message: string,
    error?: unknown,
    context?: Record<string, unknown>,
  ) {
    this.logger.error(
      this.createLogEntry(
        'SYSTEM_CRITICAL',
        'critical',
        message,
        context,
        error,
      ),
    );
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    if (!this.shouldLog('error')) return;
    this.logger.error(
      this.createLogEntry('SYSTEM_ERROR', 'error', message, context, error),
    );
  }

  warn(message: string, error?: unknown, context?: Record<string, unknown>) {
    if (!this.shouldLog('warn')) return;
    this.logger.warn(
      this.createLogEntry('USER_WARNING', 'warn', message, context, error),
    );
  }

  notice(message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog('notice')) return;
    this.logger.log(
      this.createLogEntry('SYSTEM_NOTICE', 'notice', message, context),
    );
  }

  info(message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog('info')) return;
    this.logger.log(
      this.createLogEntry('SYSTEM_INFO', 'info', message, context),
    );
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog('debug')) return;
    this.logger.debug(
      this.createLogEntry('SYSTEM_DEBUG', 'debug', message, context),
    );
  }

  trace(message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog('trace')) return;
    this.logger.verbose(
      this.createLogEntry('SYSTEM_TRACE', 'trace', message, context),
    );
  }

  logHttpRequest(
    request: Request,
    responseTime: number,
    correlationId?: string,
  ) {
    if (!this.shouldLog('info')) return;

    const metadata = {
      method: request.method,
      path: request.path,
      statusCode: request.statusCode,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      responseTime,
      responseTimeUnit: 'ms',
      correlationId: correlationId || this.generateCorrelationId(),
    };

    this.info('HTTP Request', metadata);
    return metadata.correlationId;
  }

  logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details?: Record<string, unknown>,
  ) {
    const level =
      severity === 'critical'
        ? 'alert'
        : severity === 'high'
          ? 'error'
          : 'warn';

    if (!this.shouldLog(level)) return;

    const context = {
      severity,
      immutable: true,
      ...this.redactSensitiveData(details || {}),
    };

    this[level](`Security Event: ${event}`, undefined, context);
  }

  // Domain-specific helpers (keep your existing ones)
  logUserAttempt(message: string, context: Record<string, unknown> = {}) {
    this.info(`AUTH_ATTEMPT: ${message}`, context);
  }

  logUserSuccess(message: string, context?: Record<string, unknown>) {
    this.info(`AUTH_SUCCESS: ${message}`, context);
  }
}
