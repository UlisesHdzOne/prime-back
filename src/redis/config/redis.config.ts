// src/redis/config/redis.config.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validateSync, MinLength, IsBooleanString, IsOptional, IsString } from 'class-validator';

class RedisConfigSchema {
  @IsString()
  REDIS_HOST: string;

  @IsString()
  REDIS_PORT: string;

  @IsOptional()
  @MinLength(12, { message: 'REDIS_PASSWORD must be at least 12 characters in production' })
  REDIS_PASSWORD?: string;

  @IsBooleanString()
  REDIS_TLS: string;
}

@Injectable()
export class RedisConfig {
  public readonly host: string;
  public readonly port: number;
  public readonly password?: string;
  public readonly tlsEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const validated = plainToInstance(RedisConfigSchema, {
      REDIS_HOST: configService.get('REDIS_HOST'),
      REDIS_PORT: configService.get('REDIS_PORT'),
      REDIS_PASSWORD: configService.get('REDIS_PASSWORD'),
      REDIS_TLS: configService.get('REDIS_TLS'),
    });

    const errors = validateSync(validated, { whitelist: true });
    if (errors.length > 0) {
      throw new Error(`Redis config validation failed: ${errors.map(e => e.toString()).join(', ')}`);
    }

    if (process.env.NODE_ENV === 'production' && !validated.REDIS_PASSWORD) {
      throw new Error('REDIS_PASSWORD is required in production');
    }

    this.host = validated.REDIS_HOST;
    this.port = parseInt(validated.REDIS_PORT, 10);
    this.password = validated.REDIS_PASSWORD;
    this.tlsEnabled = validated.REDIS_TLS === 'true';
  }
}