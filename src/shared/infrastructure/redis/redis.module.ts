// src/shared/infrastructure/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisConfig } from '../../config/redis.config';

@Module({
  imports: [ConfigModule],
  providers: [
    RedisConfig,
    {
      provide: 'REDIS_CLIENT',
      inject: [RedisConfig],
      useFactory: (redisConfig: RedisConfig) => {
        const redis = new Redis({
          ...redisConfig.options,
          retryStrategy: (times) => Math.min(times * 100, 5000),
          maxRetriesPerRequest: 3,
          reconnectOnError: (err) => /READONLY|ETIMEDOUT/.test(err.message),
        });

        redis.on('connect', () => console.log('Connected to Redis'));
        redis.on('error', (err) => console.error('Redis error:', err));
        redis.on('reconnecting', (delay) =>
          console.log(`Reconnecting in ${delay}ms`),
        );

        return redis;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
