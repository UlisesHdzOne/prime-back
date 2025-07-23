import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '../../application/dto/register.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { MessageService } from 'src/shared/services/message.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly messages: MessageService,
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
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
    try {
      const user = await this.registerUseCase.execute(dto);
      return { id: user.id, name: user.name, email: user.email };
    } catch (error) {
      if (error.code === 'EMAIL_TAKEN') {
        const msg = await this.messages.emailAlreadyRegistered();
        throw new BadRequestException(msg);
      }
      throw error;
    }
  }
  // ==== REGISTER ====

  // ==== LOGIN ====
  @Post('login')
  @ApiOperation({
    summary: 'Login de usuarios',
    description: 'Inicia sesión para usuarios registrados',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Usuario logueado exitosamente',
    schema: {
      example: { access_token: 'jwt_token_aqui' },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Credenciales inválidas',
    schema: {
      example: {
        statusCode: 400,
        message: 'Correo o contraseña inválidos',
        error: 'Bad Request',
      },
    },
  })
  async login(@Body() dto: LoginDto) {
    try {
      return await this.loginUseCase.execute(dto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        const msg = await this.messages.invalidCredentials();
        throw new UnauthorizedException(msg);
      }
      throw error;
    }
  }
  // ==== LOGIN ====
}
