import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLogger {

  private readonly logger = new Logger(AppLogger.name);

  logUserAttempt(message: string) {
    this.logger.log(message);
  }

  warnUser(message: string) {
    this.logger.warn(message);
  }

  logUserSuccess(message: string) {
    this.logger.log(message);
  }
}
