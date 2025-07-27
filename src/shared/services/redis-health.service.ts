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
      console.error('Redis health check failed:', error.message);
      return false; // Return false instead of throwing
    }
  }

  async getStatus() {
    return {
      status: (await this.checkConnection()) ? 'ready' : 'down',
      time: new Date().toISOString(),
    };
  }
}
