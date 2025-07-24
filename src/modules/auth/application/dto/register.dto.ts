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
