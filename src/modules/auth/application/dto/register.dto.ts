import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Equals,
  validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'IsStrongPassword', async: false })
class IsStrongPassword implements ValidatorConstraintInterface {
  validate(password: string) {
    // Al menos 8 caracteres, una mayúscula, un número y un símbolo
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(password);
  }
  defaultMessage(args: ValidationArguments) {
    return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial';
  }
}

@ValidatorConstraint({ name: 'MatchPasswords', async: false })
class MatchPasswords implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    return value === object.password;
  }
  defaultMessage(args: ValidationArguments) {
    return 'Las contraseñas no coinciden';
  }
}

export class RegisterDto {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Perez' })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan@mail.com',
  })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    minLength: 8,
    maxLength: 50,
    example: 'P4ssw0rd!',
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  @Validate(IsStrongPassword)
  password: string;

  @ApiProperty({
    description: 'Confirmación de contraseña',
    minLength: 8,
    maxLength: 50,
    example: 'P4ssw0rd!',
  })
  @IsNotEmpty()
  @Validate(MatchPasswords)
  passwordConfirm: string;
}
