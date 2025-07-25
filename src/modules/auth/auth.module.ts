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
import { getMsFromExpiresIn } from 'src/shared/utils/jwt.utils';
import { EnvVariables } from 'src/shared/config/env-config.interface';
import {
  InvalidJwtConfigException,
  WeakSecretException,
  InvalidExpiresInFormatException,
} from 'src/shared/exceptions/auth.exceptions';

const useCases = [RegisterUseCase, LoginUseCase, LogoutUseCase];

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService<EnvVariables>) => {
        const secret = configService.get('JWT_SECRET');
        const expiresIn = configService.get('JWT_EXPIRES_IN');

        if (!secret || !expiresIn) {
          throw new InvalidJwtConfigException(
            'JWT_SECRET o JWT_EXPIRES_IN no definidos',
          );
        }

        if (secret.length < 32) {
          throw new WeakSecretException();
        }

        try {
          getMsFromExpiresIn(expiresIn);
        } catch (error) {
          throw new InvalidExpiresInFormatException(error.message);
        }

        return {
          secret,
          signOptions: { expiresIn },
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
          throw new InvalidJwtConfigException(
            'JWT_SECRET o JWT_EXPIRES_IN no definidos',
          );
        }

        if (secret.length < 32) {
          throw new WeakSecretException();
        }

        try {
          getMsFromExpiresIn(expiresIn);
        } catch (error) {
          throw new InvalidExpiresInFormatException(error.message);
        }

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
