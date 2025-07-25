import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import * as dotenv from 'dotenv';
import { EnvConfig } from './env-config.dto';

dotenv.config();

function validateEnv(config: any): EnvConfig {
  const validatedConfig = plainToInstance(EnvConfig, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(`Invalid environment variables: ${errors}`);
  }
  return validatedConfig;
}

const envConfig = validateEnv(process.env);

export default () => ({
  postgresUser: envConfig.POSTGRES_USER,
  postgresPassword: envConfig.POSTGRES_PASSWORD,
  postgresDb: envConfig.POSTGRES_DB,
  databaseUrl: envConfig.DATABASE_URL,
  jwt: {
    secret:
      envConfig.JWT_SECRET || 'default-secret-de-desarrollo-solo-para-testing',
    expiresIn: envConfig.JWT_EXPIRES_IN || '1h',
  },
});
