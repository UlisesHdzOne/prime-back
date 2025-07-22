import { Controller, Post, Body } from '@nestjs/common';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '../../application/dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description: 'Ruta para crear un nuevo usurio en el sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: { name: 'Juan', email: 'juan@mail.com' },
    },
  })
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUseCase.execute(dto);
    return { id: user.id, name: user.name, email: user.email };
  }
}
