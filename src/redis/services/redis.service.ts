import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import RedisClient from 'ioredis';
import { RedisConfig } from '../config/redis.config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor(private readonly redisConfig: RedisConfig) {
    this.client = new RedisClient({
      host: this.redisConfig.host,
      port: this.redisConfig.port,
      password: this.redisConfig.password,
      tls: this.redisConfig.tls ? {} : undefined,
    });

    this.client.on('connect', () => console.log('Redis connected'));
    this.client.on('error', (err) => console.error('Redis error:', err));
  }

  getClient(): Redis {
    return this.client;
  }

  async ping(): Promise<string> {
    return await this.client.ping();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(
    key: string,
    value: string,
    expireSeconds?: number,
  ): Promise<'OK' | null> {
    if (expireSeconds) {
      return this.client.set(key, value, 'EX', expireSeconds);
    }
    return this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }
}
