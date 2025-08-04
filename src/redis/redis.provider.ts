import Redis from 'ioredis';
import { RedisConfig } from './config/redis.config';

export const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: (config: RedisConfig) => {
    const options: any = {
      host: config.host,
      port: config.port,
      password: config.password,
    };

    if (config.tlsEnabled) {
      options.tls = {
        rejectUnauthorized: true,
      };
    }

    return new Redis(options);
  },
  inject: [RedisConfig],
};