import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisConfig } from '../../config/redis.config';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RedisConfig,
    {
      provide: 'REDIS_CLIENT',
      inject: [RedisConfig],
      useFactory: (redisConfig: RedisConfig) => {
        const redis = new Redis(redisConfig.options);

        redis.on('connect', () => console.log('Redis connected'));
        redis.on('ready', () => console.log('Redis ready'));
        redis.on('error', (err) => console.error('Redis error:', err));
        redis.on('close', () => console.log('Redis connection closed'));
        redis.on('reconnecting', () => console.log('Redis reconnecting'));
        redis.on('end', () => console.log('Redis connection ended'));

        return redis;
      },
    },
  ],
  exports: ['REDIS_CLIENT', RedisConfig],
})
export class RedisModule {}
