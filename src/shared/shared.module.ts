import { Module, Global } from '@nestjs/common';
import { AppLogger } from './services/app-logger.service';
import { MessageService } from './services/message.service';
//import { AllExceptionsFilter } from './filters/http-exception.filter';
import { JwtConfigService } from './config/jwt-config.service';
import { RedisModule } from '../redis/infrastructure/redis.module';
import { RedisHealthService } from '../health/redis-health.service';
import { GlobalExceptionFilter } from './filters/http-exception.filter';
import { PasswordService } from './services/password.service';
import { hibpHttpClientFactory } from './providers/hibp-http-client.provider';
import { NotificationService } from './services/notification.service';

@Global()
@Module({
  imports: [RedisModule],
  providers: [
    AppLogger,
    MessageService,
    GlobalExceptionFilter,
    JwtConfigService,
    RedisHealthService,
    PasswordService,
    hibpHttpClientFactory,
    NotificationService,
  ],
  exports: [
    AppLogger,
    MessageService,
    GlobalExceptionFilter,
    JwtConfigService,
    RedisHealthService,
    PasswordService,
    'HIBP_CLIENT',
    NotificationService,
  ],
})
export class SharedModule {}
