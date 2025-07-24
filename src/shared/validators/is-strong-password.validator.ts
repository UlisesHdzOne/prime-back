import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsStrongPassword', async: false })
export class IsStrongPassword implements ValidatorConstraintInterface {
  validate(password: string): boolean {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(password);
  }

  defaultMessage(args: ValidationArguments): string {
    return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial';
  }
}
