import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import * as dotenv from 'dotenv';
import { EnvConfig } from './env-config.dto';

dotenv.config();

function validateEnv(config: NodeJS.ProcessEnv): EnvConfig {
  const validatedConfig = plainToInstance(EnvConfig, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const formattedErrors = errors
      .map((err) => Object.values(err.constraints || {}).join(', '))
      .join('\n');
    throw new Error(`❌ Invalid environment variables:\n${formattedErrors}`);
  }

  // Validaciones adicionales para producción
  if (config.NODE_ENV === 'production') {
    if (validatedConfig.JWT_SECRET.length < 32) {
      throw new Error('❌ JWT_SECRET debe tener al menos 32 caracteres en producción.');
    }

    const maxSeconds = 60 * 60 * 24; // 1 día
    const timeStr = validatedConfig.JWT_EXPIRES_IN;

    const match = timeStr.match(/^(\d+)([smhd])$/);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];

      const unitToSeconds = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400,
      };

      const totalSeconds = value * unitToSeconds[unit];
      if (totalSeconds > maxSeconds) {
        throw new Error('❌ JWT_EXPIRES_IN demasiado largo para producción (máx: 1 día).');
      }
    } else {
      throw new Error('❌ JWT_EXPIRES_IN tiene un formato inválido.');
    }

    if (validatedConfig.DATABASE_URL.startsWith('http://')) {
      throw new Error('❌ DATABASE_URL no debe usar protocolo HTTP en producción.');
    }
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
