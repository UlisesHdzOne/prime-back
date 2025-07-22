import { Controller, Post, Body } from '@nestjs/common';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '../../application/dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase
  ) {}

  // ==== REGISTER ====
  @Post('register')
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description: 'Crea un usuario si el correo no ha sido registrado',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: { id: 1, name: 'Juan', email: 'juan@mail.com' },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Correo electrónico ya registrado',
    schema: {
      example: {
        statusCode: 400,
        message: 'Correo electrónico ya registrado',
        error: 'Bad Request',
      },
    },
  })
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUseCase.execute(dto);
    return { id: user.id, name: user.name, email: user.email };
  }
  // ==== REGISTER ====

}
