import { Module, Global } from '@nestjs/common';
import { AppLogger } from './services/app-logger.service';
import { MessageService } from './services/message.service';

@Global()
@Module({
  providers: [AppLogger,MessageService],
  exports: [AppLogger,MessageService],
})
export class SharedModule {}
