import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaRevokedTokenRepository } from './infrastructure/repositories/revoked-token.repository'; // Asegúrate que la ruta sea correcta
import { SharedModule } from 'src/shared/shared.module';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppLogger } from 'src/shared/services/app-logger.service';
import { MessageService } from 'src/shared/services/message.service';

const useCases = [
  RegisterUseCase,
  LoginUseCase, 
  LogoutUseCase
];

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        console.log('JWT_SECRET from configService:', secret);
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
  controllers: [AuthController],
  providers: [
    ...useCases,
    MessageService,
    AppLogger,
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
