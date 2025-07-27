import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthService implements OnModuleInit {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async onModuleInit() {
    await this.checkConnection();
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      throw new Error(`Redis connection failed: ${error.message}`);
    }
  }

  async getStatus() {
    return {
      status: (await this.checkConnection()) ? 'ready' : 'down',
      time: new Date().toISOString(),
    };
  }
}
