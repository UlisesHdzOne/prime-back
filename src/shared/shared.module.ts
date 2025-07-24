import { Module, Global } from '@nestjs/common';
import { AppLogger } from './services/app-logger.service';
import { MessageService } from './services/message.service';
import { AllExceptionsFilter } from './filters/http-exception.filter';

@Global()
@Module({
  providers: [AppLogger, MessageService, AllExceptionsFilter],
  exports: [AppLogger, MessageService, AllExceptionsFilter],
})
export class SharedModule {}
