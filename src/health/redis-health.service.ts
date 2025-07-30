import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { RedisService } from 'src/redis/services/redis.service';
//import { RedisService } from './redis.service';

@Injectable()
export class RedisHealthService extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async ping(): Promise<HealthIndicatorResult> {
    try {
      const client = this.redisService.getClient();
      const pong = await client.ping();
      if (pong !== 'PONG') throw new Error('Redis no respondió PONG');
      return this.getStatus('redis', true);
    } catch {
      throw new HealthCheckError(
        'Redis health check failed',
        this.getStatus('redis', false),
      );
    }
  }
}
