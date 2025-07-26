import { Module, Global } from '@nestjs/common';
import { AppLogger } from './services/app-logger.service';
import { MessageService } from './services/message.service';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { JwtConfigService } from './config/jwt-config.service';

@Global()
@Module({
  providers: [
    AppLogger,
    MessageService,
    AllExceptionsFilter,
    JwtConfigService,
  ],
  exports: [
    AppLogger,
    MessageService,
    AllExceptionsFilter,
    JwtConfigService,
  ],
})
export class SharedModule {}
