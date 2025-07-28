import { Module, Global } from '@nestjs/common';
import { AppLogger } from './services/app-logger.service';
import { MessageService } from './services/message.service';
//import { AllExceptionsFilter } from './filters/http-exception.filter';
import { JwtConfigService } from './config/jwt-config.service';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RedisHealthService } from './services/redis-health.service';
import { GlobalExceptionFilter } from './filters/http-exception.filter';

@Global()
@Module({
  imports: [RedisModule],
  providers: [
    AppLogger,
    MessageService,
    GlobalExceptionFilter,
    JwtConfigService,
    RedisHealthService,
  ],
  exports: [
    AppLogger,
    MessageService,
    GlobalExceptionFilter,
    JwtConfigService,
    RedisHealthService,
  ],
})
export class SharedModule {}
