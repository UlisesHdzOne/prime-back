import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JWT_CONSTANTS } from './jwt.constants';
import { validateSecretStrength } from './jwt.utils';
import { InvalidJwtConfigException } from '../exceptions/auth.exceptions';
import { JwtConfig } from './jwt.config.interface';


@Injectable()
export class JwtConfigService {
  constructor(private readonly configService: ConfigService) {}

  getJwtConfig(): JwtConfig {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const secret = this.configService.get<string>('JWT_SECRET') || JWT_CONSTANTS.DEV_SECRET;
    const expiresIn =
      this.configService.get<string>('JWT_EXPIRES_IN') ||
      (isProduction ? JWT_CONSTANTS.PROD_EXPIRES_IN : JWT_CONSTANTS.DEFAULT_EXPIRES_IN);

    this.validateConfig(secret, expiresIn, isProduction);

    return {
      secret,
      expiresIn,
      expiration: this.getMsFromExpiresIn(expiresIn),
      isProduction,
    };
  }

  getActiveSecrets(): string[] {
    const config = this.getJwtConfig();
    const secrets = [config.secret];
    const previous = this.configService.get<string>('JWT_PREVIOUS_SECRET');
    if (previous) secrets.push(previous);
    return secrets;
  }

  private validateConfig(secret: string, expiresIn: string, isProduction: boolean): void {
    try {
      validateSecretStrength(secret, isProduction);
      this.validateExpiresIn(expiresIn);
    } catch (error) {
      throw new InvalidJwtConfigException(error.message);
    }
  }

  private validateExpiresIn(expiresIn: string): void {
    const regex = /^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/;
    if (!regex.test(expiresIn)) {
      throw new InvalidJwtConfigException(
        'JWT_EXPIRES_IN must be a valid duration string like "2d5h30m10s" with units in order d, h, m, s',
      );
    }
  }

  private getMsFromExpiresIn(expiresIn: string): number {
    let totalMs = 0;
    const regex = /(\d+d)?(\d+h)?(\d+m)?(\d+s)?/;
    const matches = expiresIn.match(regex);
    if (!matches) return 0;

    const dayMs = 24 * 60 * 60 * 1000;
    const hourMs = 60 * 60 * 1000;
    const minMs = 60 * 1000;
    const secMs = 1000;

    const days = matches[1] ? parseInt(matches[1]) : 0;
    const hours = matches[2] ? parseInt(matches[2]) : 0;
    const mins = matches[3] ? parseInt(matches[3]) : 0;
    const secs = matches[4] ? parseInt(matches[4]) : 0;

    totalMs += days * dayMs + hours * hourMs + mins * minMs + secs * secMs;
    return totalMs;
  }
}
