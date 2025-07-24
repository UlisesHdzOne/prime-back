import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { I18nService } from 'nestjs-i18n';
@Injectable()
@ValidatorConstraint({ name: 'IsStrongPassword', async: false })
export class IsStrongPassword implements ValidatorConstraintInterface {
  constructor(private readonly i18n: I18nService) {}

  validate(password: string): boolean {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(password);
  }

  defaultMessage(args: ValidationArguments): string {
    return this.i18n.t('VALIDATION.PASSWORD_STRENGTH');
  }
}
