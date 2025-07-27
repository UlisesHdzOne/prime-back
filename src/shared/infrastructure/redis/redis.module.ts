import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          password: configService.get<string>('REDIS_PASSWORD'),
          tls: configService.get<string>('REDIS_TLS') === 'true' ? {} : undefined,
          retryStrategy: (times) => Math.min(times * 100, 5000),
          maxRetriesPerRequest: 3,
          reconnectOnError: (err) => /READONLY|ETIMEDOUT/.test(err.message),
        });

        redis.on('connect', () => console.log('Connected to Redis'));
        redis.on('error', (err) => console.error('Redis error:', err));
        redis.on('reconnecting', (delay) => 
          console.log(`Reconnecting in ${delay}ms`)
        );

        return redis;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
