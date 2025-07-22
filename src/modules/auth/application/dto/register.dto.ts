import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'IsStrongPassword', async: false })
class IsStrongPassword implements ValidatorConstraintInterface {
  validate(password: string) {
    // Al menos 8 caracteres, una mayúscula, un número y un símbolo
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(password);
  }
  defaultMessage() {
    return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial';
  }
}

export class RegisterDto {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Pérez' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan@mail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    minLength: 8,
    example: 'P4ssw0rd!',
  })
  @IsNotEmpty()
  @MinLength(8)
  @Validate(IsStrongPassword)
  password: string;
}
