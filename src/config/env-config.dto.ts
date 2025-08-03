import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class EnvConfig {
  @IsEnum(['development', 'production', 'test'] as const)
  NODE_ENV: 'development' | 'production' | 'test';

  @IsString()
  @IsOptional()
  API_VERSION?: string;

  @ValidateIf((o) => o.NODE_ENV === 'production')
  @IsString()
  POSTGRES_USER: string;

  @ValidateIf((o) => o.NODE_ENV === 'production')
  @IsString()
  POSTGRES_PASSWORD: string;

  @ValidateIf((o) => o.NODE_ENV === 'production')
  @IsString()
  POSTGRES_DB: string;

  @Matches(/^postgres(?:ql)?:\/\/.+/, {
    message: 'DATABASE_URL must be a valid PostgreSQL URL',
  })
  @IsString()
  DATABASE_URL: string;

  @Matches(/^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/, {
    message:
      'JWT_EXPIRES_IN must be a valid duration string like "2d5h30m10s" with units in order d, h, m, s',
  })
  JWT_EXPIRES_IN: string;

  @IsString()
  JWT_SECRET: string;

  @ValidateIf((o) => o.NODE_ENV === 'production')
  @IsString()
  CORS_ALLOWED_ORIGINS?: string;

  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsNumberString()
  @IsOptional()
  REDIS_PORT?: string;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  @IsOptional()
  REDIS_TLS?: string;

  @IsNumberString()
  @IsOptional()
  PORT?: string;

  @ValidateIf((o) => o.NODE_ENV === 'production')
  @IsString()
  @IsOptional()
  SENTRY_DSN?: string;

  @IsString()
  @IsOptional()
  APP_NAME?: string;
}
