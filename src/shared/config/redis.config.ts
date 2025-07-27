// src/shared/config/redis.config.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

class RedisConfigSchema {
  @IsString()
  REDIS_HOST: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  REDIS_PORT: number;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean()
  REDIS_TLS?: boolean;
}

@Injectable()
export class RedisConfig {
  private readonly validatedConfig: RedisConfigSchema;

  constructor(private readonly configService: ConfigService) {
    this.validatedConfig = this.validateConfig();
  }

  private validateConfig(): RedisConfigSchema {
    const config = {
      REDIS_HOST: this.configService.get<string>('REDIS_HOST'),
      REDIS_PORT: this.configService.get<string>('REDIS_PORT'),
      REDIS_PASSWORD: this.configService.get<string>('REDIS_PASSWORD'),
      REDIS_TLS: this.configService.get<string>('REDIS_TLS'),
    };

    const validated = plainToInstance(RedisConfigSchema, config, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(validated, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new Error(
        `Redis config validation error: ${JSON.stringify(errors, null, 2)}\n` +
          `Current config: ${JSON.stringify(config, null, 2)}`,
      );
    }

    return validated;
  }

  get host(): string {
    return this.validatedConfig.REDIS_HOST || 'localhost';
  }

  get port(): number {
    return this.validatedConfig.REDIS_PORT || 6379;
  }

  get password(): string | undefined {
    return this.validatedConfig.REDIS_PASSWORD;
  }

  get tls(): boolean {
    return this.validatedConfig.REDIS_TLS || false;
  }

get options() {
  return {
    host: process.env.REDIS_HOST || 'redis-cache', // Valor por defecto
    port: parseInt(process.env.REDIS_PORT || '6379', 10), // Valor por defecto
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 100, 5000);
      console.log(`Redis retry attempt ${times}, delaying ${delay}ms`);
      return delay;
    },
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    connectTimeout: 10000,
  };
}
}
