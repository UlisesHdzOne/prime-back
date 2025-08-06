import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { IRedisClient } from '../interfaces/redis-client.interface';
import retry from 'async-retry';
import { AppLogger } from 'src/shared/services/app-logger.service';
import { HealthCheckResult } from '@nestjs/terminus';

@Injectable()
export class RedisService implements IRedisClient, OnModuleDestroy {
  private readonly operationTimeout = 5000;

  constructor(
    @Inject('REDIS_CLIENT') private readonly client: IRedisClient,
    private readonly logger: AppLogger,
  ) {
    this.logger.info('RedisService initialized');
  }

  getClient(): IRedisClient {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.executeWithRetry(() => this.client.get(key), 'GET');
  }

  private logRetryMetrics(
    operation: string,
    success: boolean,
    durationMs: number,
  ) {
    this.logger.info(`Redis operation metrics`, {
      operation,
      success,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  }

  async set(
    key: string,
    value: string,
    expireSeconds?: number,
  ): Promise<'OK' | null> {
    return this.executeWithRetry(
      () => this.client.set(key, value, expireSeconds),
      'SET',
    );
  }

  async del(key: string): Promise<number> {
    return this.executeWithRetry(() => this.client.del(key), 'DEL');
  }

  async ping(): Promise<string> {
    return this.executeWithRetry(() => this.client.ping(), 'PING');
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    operation: string,
  ): Promise<T> {
    return retry(
      async () => {
        const start = Date.now();
        try {
          const result = await Promise.race([
            fn(),
            new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error('Redis operation timeout')),
                this.operationTimeout,
              ),
            ),
          ]);
          const duration = Date.now() - start;
          this.logRetryMetrics(operation, true, duration);
          return result as T;
        } catch (error: any) {
          const duration = Date.now() - start;
          this.logRetryMetrics(operation, false, duration);
          this.logger.error(`${operation} failed: ${error.message}`);
          throw error;
        }
      },
      {
        retries: 3,
        onRetry: (err, attempt) => {
          this.logger.warn(`Retry ${attempt} for ${operation}: ${err.message}`);
        },
      },
    );
  }

  async quit(): Promise<void> {
    await this.client.quit();
  }

  async onModuleDestroy() {
    await this.quit();
  }
}
