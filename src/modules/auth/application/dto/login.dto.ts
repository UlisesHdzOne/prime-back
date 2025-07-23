import { IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'juan@mail.com',
    description: 'Correo electrónico',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @ApiProperty({ example: 'P4ssw0rd!', description: 'Contraseña' })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}
