import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaRevokedTokenRepository } from './infrastructure/repositories/prisma-revoked-token.repository';
import { SharedModule } from 'src/shared/shared.module';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { ConfigModule } from '@nestjs/config';
import { AppLogger } from 'src/shared/services/app-logger.service';
import { MessageService } from 'src/shared/services/message.service';
import { JwtConfigModule } from 'src/shared/config/jwt-config.module';
import { RedisModule } from 'src/redis/infrastructure/redis.module';
import { rateLimitMiddleware } from 'src/shared/config/middleware/rate-limit.middleware';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { BreachCheckProcessor } from './application/processors/breach-check.processor';
const useCases = [RegisterUseCase, LoginUseCase, LogoutUseCase];

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [JwtConfigModule],
      inject: ['JWT_CONFIG'],
      useFactory: (jwtConfig) => ({
        secret: jwtConfig.secret,
        signOptions: { expiresIn: jwtConfig.expiresIn },
      }),
    }),
    BullModule.registerQueue({
      name: 'breachCheck',
    }),
    CacheModule.register(),
    PrismaModule,
    SharedModule,
    RedisModule,
    RedisModule,
  ],
  exports: [PrismaRevokedTokenRepository],
  controllers: [AuthController],
  providers: [
    ...useCases,
    MessageService,
    AppLogger,
    PrismaRevokedTokenRepository,
    BreachCheckProcessor,
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
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(rateLimitMiddleware)
      .forRoutes('auth/login', 'auth/register'); // protege estas rutas
  }
}
