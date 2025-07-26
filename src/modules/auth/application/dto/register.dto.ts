import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from 'src/shared/validators/is-strong-password.validator';
import { MatchPasswords } from 'src/shared/validators/match-passwords.validator';

export class RegisterDto {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Perez' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El nombre debe tener máximo 50 caracteres' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan@mail.com',
  })
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  @MaxLength(100, { message: 'El correo debe tener máximo 100 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    minLength: 8,
    maxLength: 50,
    example: 'P4ssw0rd!',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña debe tener máximo 50 caracteres' })
  @Validate(IsStrongPassword)
  password: string;

  @ApiProperty({
    description: 'Confirmación de contraseña',
    minLength: 8,
    maxLength: 50,
    example: 'P4ssw0rd!',
  })
  @IsNotEmpty({ message: 'La confirmación de contraseña es obligatoria' })
  @Validate(MatchPasswords, {
    message: 'La confirmación de contraseña no coincide con la contraseña',
  })
  passwordConfirm: string;
}
