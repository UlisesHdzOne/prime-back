import { Injectable, Logger } from '@nestjs/common';
import { User } from 'src/modules/auth/domain/entities/user.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async notifyPasswordBreach(user: User): Promise<void> {
    // Aquí implementa el envío real: email, Slack, etc.
    // Por ahora solo logueamos el aviso:
    this.logger.warn(`Notificación enviada a usuario ${user.email} por brecha de contraseña`);
  }
}
