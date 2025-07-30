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

  @IsString()
  REDIS_PASSWORD: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  REDIS_TLS?: boolean;
}

@Injectable()
export class RedisConfig {
  private readonly config: RedisConfigSchema;

  constructor(private readonly configService: ConfigService) {
    const validated = plainToInstance(RedisConfigSchema, {
      REDIS_HOST: this.configService.get<string>('REDIS_HOST'),
      REDIS_PORT: this.configService.get<string>('REDIS_PORT'),
      REDIS_PASSWORD: this.configService.get<string>('REDIS_PASSWORD'),
      REDIS_TLS: this.configService.get<string>('REDIS_TLS'),
    });

    const errors = validateSync(validated, {
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      throw new Error(`Redis config validation failed: ${errors}`);
    }

    this.config = validated;
  }

  get host() {
    return this.config.REDIS_HOST;
  }

  get port() {
    return this.config.REDIS_PORT;
  }

  get password() {
    return this.config.REDIS_PASSWORD;
  }

  get tls() {
    return this.config.REDIS_TLS;
  }
}
