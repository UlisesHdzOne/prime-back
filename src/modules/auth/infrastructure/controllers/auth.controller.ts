import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TokenMissingException } from 'src/shared/exceptions/auth.exceptions';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterDto } from '../../application/dto/register.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { MessageService } from 'src/shared/services/message.service';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { AppLogger } from 'src/shared/services/app-logger.service';
import { RevokedTokenGuard } from '../../application/guards/revoked-token.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly messages: MessageService,
    private readonly logger: AppLogger,
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  // ==== REGISTER ====
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a user if the email is not already registered',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: { id: 1, name: 'Juan', email: 'juan@mail.com' },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email already registered',
    schema: {
      example: {
        statusCode: 400,
        message: 'Email already registered',
        error: 'Bad Request',
      },
    },
  })
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUseCase.execute(dto);
    this.logger.logUserSuccess(`User registered: ${user.email}`);
    return { id: user.id, name: user.name, email: user.email };
  }

  // ==== LOGIN ====
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Logs in registered users',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    schema: {
      example: { access_token: 'jwt_token_here' },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid email or password',
        error: 'Bad Request',
      },
    },
  })
  async login(@Body() dto: LoginDto) {
    return await this.loginUseCase.execute(dto);
  }

  // ==== LOGOUT ====
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout',
    description: 'Revokes the token to log out',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: { example: { message: 'Session closed successfully.' } },
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Missing or invalid authentication token.',
        error: 'Unauthorized',
      },
    },
  })
  @UseGuards(RevokedTokenGuard)
  async logout(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      this.logger.warnUser('Missing authorization header');
      throw new TokenMissingException();
    }
    const token = authHeader.replace('Bearer ', '');
    await this.logoutUseCase.execute(token);
    this.logger.logUserSuccess('Logout successful');
    const msg = this.messages.logoutSuccess();

    return { message: msg };
  }
}
