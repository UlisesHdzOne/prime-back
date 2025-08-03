import { EnvConfig } from './env-config.dto';

export const defaultDevConfig: Partial<EnvConfig> = {
  NODE_ENV: 'development',
  PORT: '3000',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  JWT_SECRET: 'dev-secret-at-least-32-chars-xxxxxx',
  JWT_EXPIRES_IN: '1h',
};
