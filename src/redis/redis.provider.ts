import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export const redisProvider = {
  provide: 'REDIS_CLIENT',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    return new Redis({
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
      password: config.get('REDIS_PASSWORD'),
      tls: config.get('REDIS_TLS') === 'true' ? {} : undefined,
    });
  },
};
