import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { MessageService } from '../services/message.service';

@Injectable()
@ValidatorConstraint({ name: 'IsStrongPassword', async: false })
export class IsStrongPassword implements ValidatorConstraintInterface {
  constructor(private readonly messages: MessageService) {}

  validate(password: string): boolean {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(password);
  }

  defaultMessage(args: ValidationArguments): string {
    return this.messages.passwordRequirements();
  }
}
