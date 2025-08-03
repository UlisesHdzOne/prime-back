// src/shared/auth/jwt/validators/jwt-secret.validator.ts
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { validateSecretStrength } from '../config/jwt.utils';
//import { validateSecretStrength } from '../utils/jwt.utils';

@ValidatorConstraint({ name: 'isStrongJwtSecret', async: false })
export class IsStrongJwtSecret implements ValidatorConstraintInterface {
  validate(secret: string): boolean {
    try {
      validateSecretStrength(secret, process.env.NODE_ENV === 'production');
      return true;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'Secret is not strong enough';
  }
}
