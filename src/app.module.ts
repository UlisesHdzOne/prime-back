import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/config-loader';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { SecurityMiddleware } from './core/security/security.middleware';

import * as path from 'path';
import { HealthModule } from './health/health.module';
import { AppController } from './app.controller';
import { RedisModule } from './redis/infrastructure/redis.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: {
        path: path.join(__dirname, '../i18n/'),
        watch: true,
      },
      resolvers: [
        { use: AcceptLanguageResolver, options: { matchType: 'strict' } },
      ],
    }),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
          tls: configService.get<boolean>('REDIS_TLS') ? {} : undefined,
        },
      }),
      inject: [ConfigService],
    }),

    PrismaModule,
    AuthModule,
    SharedModule,
    HealthModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    // Aplicar middleware solo si no es entorno de test
    if (this.configService.get('NODE_ENV') !== 'test') {
      consumer.apply(SecurityMiddleware).forRoutes('*');
    }
  }
}
