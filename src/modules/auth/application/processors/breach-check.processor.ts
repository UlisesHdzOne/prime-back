import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';
import axios from 'axios';
import { AppLogger } from 'src/shared/services/app-logger.service';
import { MessageService } from 'src/shared/services/message.service';
import { User } from '../../domain/entities/user.entity';

@Processor('breachCheck')
export class BreachCheckProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly messages: MessageService,
  ) {}

  @Process()
  async handleBreachCheck(job: Job<{ user: User; password: string }>) {
    const { user, password } = job.data;

    try {
      this.logger.logUserAttempt(
        `Iniciando verificación de contraseña comprometida para ${user.email}`,
        { userId: user.id },
      );

      const isBreached = await this.isPasswordBreached(password);

      if (isBreached) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { isBreached: true },
        });

        this.logger.warn(
          this.messages.passwordBreached(),
          undefined,
          { userId: user.id, email: user.email },
        );
      }

      this.logger.logUserSuccess(
        `Verificación completada para ${user.email}`,
        { userId: user.id, isBreached },
      );
    } catch (error) {
      this.logger.error(
        `Error en la verificación de contraseña para ${user.email}`,
        error,
        { userId: user.id },
      );
      throw error;
    }
  }

  private async isPasswordBreached(password: string): Promise<boolean> {
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5).toUpperCase();

    const { data } = await axios.get(
      `https://api.pwnedpasswords.com/range/${prefix}`,
    );

    return data.split('\n').some((line: string) => line.startsWith(suffix));
  }
}
