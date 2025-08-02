import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BreachCheckProcessor } from './processors/breach-check.processor';
import { hibpHttpClientFactory } from 'src/shared/providers/hibp-http-client.provider';
import { PasswordService } from 'src/shared/services/password.service';
import { NotificationService } from 'src/shared/services/notification.service';

@Module({
  imports: [
    // Registrar la cola 'breachCheck' aquí
    BullModule.registerQueue({
      name: 'breachCheck',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: true,
        timeout: 60_000,
      },
      limiter: { max: 5, duration: 1_000 },
    }),
  ],
  providers: [
    BreachCheckProcessor,
    hibpHttpClientFactory,
    PasswordService,
    NotificationService,
  ],
  exports: [
    BullModule,
    NotificationService,
    PasswordService,
  ],
})
export class BreachCheckModule {}
