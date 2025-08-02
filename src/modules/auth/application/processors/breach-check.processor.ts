import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  Process,
  Processor,
  OnQueueFailed,
  OnQueueCompleted,
} from '@nestjs/bull';
import { Job } from 'bull';
import { User } from '../../domain/entities/user.entity';
import { PasswordService } from 'src/shared/services/password.service';
import { Counter, register } from 'prom-client';
import { NotificationService } from 'src/shared/services/notification.service';

const passwordsChecked = new Counter({
  name: 'passwords_checked_total',
  help: 'Total passwords checked for breach',
});

const breachesDetected = new Counter({
  name: 'password_breaches_detected_total',
  help: 'Total breached passwords detected',
});

@Processor('breachCheck')
@Injectable()
export class BreachCheckProcessor {
  private readonly logger = new Logger(BreachCheckProcessor.name);

  constructor(
    @Inject('HIBP_CLIENT') private readonly httpClient,
    private readonly passwordService: PasswordService,
    private readonly notificationService: NotificationService,
  ) {}

  @Process('breachCheck')
  async handleBreachCheck(job: Job<{ user: User; password: string }>) {
    const { user, password } = job.data;

    passwordsChecked.inc();

    // Usas el servicio para calcular el hash aquí
    const sha1Hash = this.passwordService.getSha1Hash(password);
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    const response = await this.httpClient.get(`/range/${prefix}`);
    const breached = response.data
      .split('\n')
      .some((line) => line.startsWith(suffix));

    if (breached) {
      breachesDetected.inc();
      this.logger.warn(
        `Contraseña comprometida detectada para usuario ${user.email}`,
      );
      await this.notifyUser(user);
    } else {
      this.logger.log(`Contraseña limpia para usuario ${user.email}`);
    }
  }

  async notifyUser(user: User) {
    await this.notificationService.notifyPasswordBreach(user);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} falló: ${error.message}`, error.stack);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job) {
    await job.remove();
  }

  // Método para exponer métricas, úsalo en un controller o endpoint
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
