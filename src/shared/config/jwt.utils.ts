import * as crypto from 'crypto';
import { WeakSecretException } from '../exceptions/auth.exceptions';
import { JWT_CONSTANTS } from './jwt.constants';

export function validateSecretStrength(secret: string, isProduction: boolean): void {
  const minLength = isProduction ? JWT_CONSTANTS.MIN_PROD_SECRET_LENGTH : JWT_CONSTANTS.MIN_SECRET_LENGTH;
  if (!secret || secret.length < minLength) {
    throw new WeakSecretException();
  }
}

export function generateStrongSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}
