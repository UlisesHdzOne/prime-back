import Redis from 'ioredis';
import { RedisConfig } from 'src/shared/config/redis.config';

export const redisProvider = {
  provide: 'REDIS_CLIENT',
  inject: [RedisConfig],
  useFactory: (redisConfig: RedisConfig) => {
    const redis = new Redis({
      ...redisConfig.options,
      retryStrategy: (times) => Math.min(times * 100, 5000),
    });

    redis.on('error', (err) => {
      console.error('Redis error', err);
    });

    return redis;
  },
};
