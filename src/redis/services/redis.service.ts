// src/redis/services/redis.service.ts
import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { IRedisClient } from '../interfaces/redis-client.interface';
//import { AppLogger } from '../../shared/logger/app.logger';
import retry from 'async-retry';
import { AppLogger } from 'src/shared/services/app-logger.service';

@Injectable()
export class RedisService implements IRedisClient, OnModuleDestroy {
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

  private logRetryMetrics(operation: string, success: boolean) {
    // Aquí enviar métricas a tu sistema (Prometheus, Datadog, etc.)
    this.logger.info(`Retry metrics for ${operation}: success = ${success}`);
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
        try {
          const result = await fn();
          this.logRetryMetrics(operation, true); // Reporta éxito
          return result;
        } catch (error) {
          this.logRetryMetrics(operation, false); // Reporta fallo
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
