import { Controller, Post, Body, UseGuards, Req, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Throttle } from '@nestjs/throttler';
import { RegisterDto } from '../../application/dto/register.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { MessageService } from 'src/shared/services/message.service';
import { AppLogger } from 'src/shared/services/app-logger.service';
import { RevokedTokenGuard } from '../../application/guards/revoked-token.guard';
import { Counter } from 'prom-client';
import { SanitizeText } from 'src/shared/decorators/sanitize.decorator';
import { TokenMissingException } from 'src/shared/exceptions/auth.exceptions';
//import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';



// Métricas
const loginCounter = new Counter({
  name: 'auth_login_attempts_total',
  help: 'Total login attempts',
  labelNames: ['status'],
});

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
      example: { 
        message: 'User registered successfully: juan@mail.com',
        user: { id: 1, name: 'Juan', email: 'juan@mail.com' }
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        statusCode: 400,
        message: ['Password must contain at least 8 characters...'],
        error: 'Bad Request'
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email already registered',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
    schema: {
      example: {
        statusCode: 429,
        message: 'ThrottlerException: Too Many Requests',
        error: 'Too Many Requests',
      },
    },
  })
  async register(@Body() @SanitizeText() dto: RegisterDto) {
    const user = await this.registerUseCase.execute(dto);
    this.logger.logUserSuccess(`User registered: ${user.email}`, {
      userId: user.id,
    });
    
    return {
      message: this.messages.userRegistrationSuccess(user.email),
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  @Post('login')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({
    summary: 'User login',
    description: 'Logs in registered users. Limited to 5 attempts per minute.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    schema: {
      example: { 
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expires_in: '15m' 
      },
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
  @ApiResponse({
    status: 429,
    description: 'Too many attempts',
    schema: {
      example: {
        statusCode: 429,
        message: 'Too many login attempts. Try again later.',
        error: 'Too Many Requests',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'An unexpected error occurred',
        error: 'Internal Server Error',
      },
    },
  })
  async login(
    @Body() @SanitizeText() dto: LoginDto,
    @Req() req: Request,
  ): Promise<{ access_token: string; expires_in: string }> {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip;
    
    this.logger.info(`Login attempt from ${ip} (${userAgent})`, {
      email: dto.email,
      userAgent,
    });

    try {
      const result = await this.loginUseCase.execute(dto);
      loginCounter.inc({ status: 'success' });
      
      return {
        access_token: result.access_token,
        expires_in: '15m', // Podría venir del JwtConfigService
      };
    } catch (error) {
      loginCounter.inc({ status: 'failed' });
      this.logger.error(`Login failed for ${dto.email} from ${ip}`, {
        error: error.message,
        stack: error.stack,
        userAgent,
      });
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(RevokedTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout',
    description: 'Revokes the token to log out. Requires valid JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: { 
      example: { 
        message: 'Successfully logged out.',
        timestamp: '2023-08-01T12:00:00.000Z' 
      } 
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Missing or invalid authentication token.',
        error: 'Unauthorized',
      },
    },
  })
  async logout(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      this.logger.warn('Missing authorization header', {
        endpoint: req.url,
        method: req.method,
      });
      throw new TokenMissingException();
    }

    const token = authHeader.replace('Bearer ', '');
    await this.logoutUseCase.execute(token);
    
    this.logger.logUserSuccess('Logout successful', {
      token: token.slice(-8) + '...', // Log parcial del token
    });

    return {
      message: this.messages.logoutSuccess(),
      timestamp: new Date().toISOString(),
    };
  }
}