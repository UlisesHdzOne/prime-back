import { Module, Global } from '@nestjs/common';
import { AppLogger } from './services/app-logger.service';
import { MessageService } from './services/message.service';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { JwtConfigService } from './config/jwt-config.service';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RedisHealthService } from './services/redis-health.service';

@Global()
@Module({
    imports: [RedisModule],
  providers: [
    AppLogger,
    MessageService,
    AllExceptionsFilter,
    JwtConfigService,
    RedisHealthService,
  ],
  exports: [
    AppLogger,
    MessageService,
    AllExceptionsFilter,
    JwtConfigService,
    RedisHealthService
  ],
})
export class SharedModule {}
