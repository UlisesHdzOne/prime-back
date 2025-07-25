import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaRevokedTokenRepository } from './infrastructure/repositories/prisma-revoked-token.repository';
import { SharedModule } from 'src/shared/shared.module';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppLogger } from 'src/shared/services/app-logger.service';
import { MessageService } from 'src/shared/services/message.service';
import { JwtConfig } from 'src/shared/config/jwt.config.interface';

const useCases = [RegisterUseCase, LoginUseCase, LogoutUseCase];

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret || secret.length < 32) {
          throw new Error('JWT_SECRET inválido o demasiado corto');
        }

        return {
          secret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
          },
        };
      },
    }),
    PrismaModule,
    SharedModule,
  ],
  exports: [PrismaRevokedTokenRepository],
  controllers: [AuthController],
  providers: [
    ...useCases,
    MessageService,
    AppLogger,
    PrismaRevokedTokenRepository,
    {
      provide: 'JWT_CONFIG',
      useFactory: (configService: ConfigService): JwtConfig => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN');

        if (!secret || !expiresIn) {
          throw new Error('Faltan variables de JWT en .env');
        }

        const getMsFromExpiresIn = (expiresIn: string): number => {
          const time = parseInt(expiresIn.slice(0, -1));
          const unit = expiresIn.slice(-1);
          switch (unit) {
            case 's':
              return time * 1000;
            case 'm':
              return time * 60 * 1000;
            case 'h':
              return time * 60 * 60 * 1000;
            case 'd':
              return time * 24 * 60 * 60 * 1000;
            default:
              return 86400 * 1000;
          }
        };

        return {
          secret,
          expiresIn,
          expiration: getMsFromExpiresIn(expiresIn),
        };
      },
      inject: [ConfigService],
    },
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IRevokedTokenRepository',
      useClass: PrismaRevokedTokenRepository,
    },
  ],
})
export class AuthModule {}
