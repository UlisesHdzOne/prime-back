import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from '../config/jwt.config.interface';
import {
  InvalidJwtConfigException,
  WeakSecretException,
  InvalidExpiresInFormatException,
} from '../exceptions/auth.exceptions';
import { getMsFromExpiresIn } from 'src/shared/utils/jwt.utils';

@Injectable()
export class JwtProviderService {
  constructor(
    private readonly configService: ConfigService
  ) {}

  getConfig(): JwtConfig {
    const secret = this.configService.get<string>('JWT_SECRET');
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN');

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
    } catch (error) {
      throw new InvalidExpiresInFormatException(error.message);
    }

    return {
      secret,
      expiresIn,
      expiration: getMsFromExpiresIn(expiresIn),
    };
  }
}
