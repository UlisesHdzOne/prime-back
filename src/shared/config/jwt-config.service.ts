import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InvalidJwtConfigException,
  WeakSecretException,
  InvalidExpiresInFormatException,
} from '../exceptions/auth.exceptions';
import { getMsFromExpiresIn } from '../utils/jwt.utils';
import { JwtConfig } from './jwt.config.interface';

@Injectable()
export class JwtConfigService {
  constructor(private readonly configService: ConfigService) {}

  getJwtConfig(): JwtConfig {
    const secret = this.configService.get<string>('JWT_SECRET');
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN');

    this.validateJwtConfig(secret, expiresIn);

    return {
      secret: secret!,
      expiresIn: expiresIn!,
      expiration: getMsFromExpiresIn(expiresIn!),
    };
  }

  private validateJwtConfig(secret?: string, expiresIn?: string): void {
    if (!secret || !expiresIn) {
      throw new InvalidJwtConfigException(
        'JWT_SECRET o JWT_EXPIRES_IN no definidos',
      );
    }

    if (secret.length < 32) {
      throw new WeakSecretException();
    }

    try {
      getMsFromExpiresIn(expiresIn);
    } catch (error: any) {
      throw new InvalidExpiresInFormatException(error.message);
    }
  }
}
