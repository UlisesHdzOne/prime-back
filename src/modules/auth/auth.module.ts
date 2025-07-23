import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { SharedModule } from 'src/shared/shared.module';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { ConfigModule, ConfigService } from '@nestjs/config';

const useCases = [RegisterUseCase, LoginUseCase];

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
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
  ],
})
export class AuthModule {}
