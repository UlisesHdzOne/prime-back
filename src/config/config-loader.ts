import * as dotenv from 'dotenv';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvConfig } from './env-config.dto';
import { ENV_KEYS } from './env-keys';
import { defaultDevConfig } from './env-defaults';
import {
  InvalidJwtConfigException,
  WeakSecretException,
} from '../shared/exceptions/auth.exceptions';
import { AppLogger } from 'src/shared/services/app-logger.service';

dotenv.config();

class FallbackLogger {
  error(message: string, error?: any) {
    console.error(`[FALLBACK] ${message}`, error);
  }
  warn(message: string) {
    console.warn(`[FALLBACK] ${message}`);
  }
  info(message: string) {
    console.log(`[FALLBACK] ${message}`);
  }
}

class ProductionSafetyValidator {
  constructor(private logger: FallbackLogger | AppLogger = new FallbackLogger()) {}

  private static checkDefaultValue(value: string, expected: string): boolean {
    return value === expected;
  }

  private validateSecurityCredentials(config: EnvConfig) {
    const isProduction = config.NODE_ENV === 'production';

    // Revisar que variables obligatorias estén definidas en producción
    ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB'].forEach((key) => {
      if (isProduction && (!config[key] || config[key].trim() === '')) {
        throw new InvalidJwtConfigException(`${key} is required in production`);
      }
    });

    const securityChecks = [
      {
        var: 'JWT_SECRET' as const,
        defaultValue: 'changeme',
        minLength: isProduction ? 32 : 8,
        exception: (msg: string) =>
          isProduction ? new WeakSecretException(msg) : new InvalidJwtConfigException(msg),
      },
      {
        var: 'POSTGRES_PASSWORD' as const,
        defaultValue: 'postgres',
        minLength: isProduction ? 12 : 4,
        exception: (msg: string) => new InvalidJwtConfigException(msg),
      },
    ];

    for (const { var: key, defaultValue, minLength, exception } of securityChecks) {
      const value = String(config[key]);
      if (ProductionSafetyValidator.checkDefaultValue(value, defaultValue)) {
        const errorMsg = `${key} uses default value`;
        this.logger.error(errorMsg);
        throw exception(errorMsg);
      }
      if (value.length < minLength) {
        const errorMsg = `${key} must be at least ${minLength} characters`;
        this.logger.warn(errorMsg);
        throw exception(errorMsg);
      }
    }
  }

  private checkDatabaseSSL(url: string, isProduction: boolean): boolean {
    if (!isProduction) {
      this.logger.info('Skipping SSL validation in development');
      return true;
    }

    try {
      const parsedUrl = new URL(url);
      return parsedUrl.searchParams.get('sslmode') === 'require';
    } catch (error) {
      this.logger.error('Invalid database URL', error);
      return false;
    }
  }

  private validatePort(port?: string) {
    if (!port) return;
    const portNum = Number(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      throw new InvalidJwtConfigException('PORT must be a valid TCP port between 1 and 65535');
    }
  }

  validate(config: EnvConfig) {
    const isProduction = config.NODE_ENV === 'production';

    this.validateSecurityCredentials(config);

    if (!this.checkDatabaseSSL(config.DATABASE_URL, isProduction)) {
      throw new InvalidJwtConfigException('Database URL must require SSL in production (?sslmode=require)');
    }

    if (isProduction && !config.CORS_ALLOWED_ORIGINS) {
      throw new InvalidJwtConfigException('CORS_ALLOWED_ORIGINS must be defined in production');
    }

    this.validatePort(config.PORT);
  }
}

function validateEnv(config: Record<string, unknown>, logger?: AppLogger): EnvConfig {
  const safeLogger = logger || new FallbackLogger();

  // Validación explícita si falta NODE_ENV en prod
  if (!config.NODE_ENV && process.env.NODE_ENV === 'production') {
    throw new InvalidJwtConfigException('NODE_ENV must be defined in production');
  }

  const filteredConfig: Record<string, unknown> = {};
  for (const key of ENV_KEYS) {
    const envValue = config[key];
    filteredConfig[key] = envValue !== undefined ? envValue : defaultDevConfig[key];
  }

  const validatedConfig = plainToInstance(EnvConfig, filteredConfig, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    validationError: { target: false },
    forbidUnknownValues: true,
    whitelist: true,
  });

  if (errors.length > 0) {
    safeLogger.error('Invalid environment configuration', {
      errors: errors.map((e) => ({
        property: e.property,
        constraints: e.constraints,
        value: e.value,
      })),
    });
    throw new InvalidJwtConfigException(
      `Invalid environment variables: ${errors.map((e) => e.property).join(', ')}`
    );
  }

  new ProductionSafetyValidator(safeLogger).validate(validatedConfig);
  return validatedConfig;
}

export default (logger?: AppLogger) => {
  try {
    const envConfig = validateEnv(process.env, logger);
    const isProduction = envConfig.NODE_ENV === 'production';

    const appConfig = {
      isProduction,
      apiVersion: envConfig.API_VERSION || '1.0.0',
      port: Number(envConfig.PORT) || 3000,
      appName: envConfig.APP_NAME || 'MyApp',
      database: {
        url: envConfig.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: true } : false,
      },
      security: {
        jwt: {
          secret: envConfig.JWT_SECRET,
          expiresIn: envConfig.JWT_EXPIRES_IN,
        },
        cors: {
          allowedOrigins:
            envConfig.CORS_ALLOWED_ORIGINS
              ?.split(',')
              .map((s) => s.trim())
              .filter(Boolean) || (isProduction ? [] : ['*']),
        },
      },
      redis: {
        host: envConfig.REDIS_HOST || 'localhost',
        port: Number(envConfig.REDIS_PORT) || 6379,
        password: envConfig.REDIS_PASSWORD,
        tls: envConfig.REDIS_TLS === 'true',
      },
      monitoring: {
        sentryDsn: envConfig.SENTRY_DSN,
      },
    };

    (logger || new FallbackLogger()).info('Application configuration loaded', {
      environment: isProduction ? 'production' : 'development',
      appName: appConfig.appName,
    });

    return appConfig;
  } catch (error) {
    console.error(
      'FATAL: Failed to load configuration',
      error instanceof Error ? error.message : error
    );
    throw error;
  }
};
