// src/modules/auth/application/processors/breach-check.processor.ts

import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
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
  async handleBreachCheck(job: Job<{ user: User; passwordHash: string }>) {
    const { user, passwordHash } = job.data;

    try {
      const prefix = passwordHash.substring(0, 5);
      const suffix = passwordHash.substring(5);

      const { data } = await axios.get(
        `https://api.pwnedpasswords.com/range/${prefix}`,
      );

      const isBreached = data
        .split('\n')
        .some((line: string) => line.startsWith(suffix));

      if (isBreached) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { isBreached: true },
        });
        this.logger.warn(this.messages.passwordBreached(), {
          userId: user.id,
          email: user.email,
        });
      }

      this.logger.logUserSuccess(`Finished breach check for ${user.email}`);
    } catch (error) {
      this.logger.error('Error in breach check processor', error, {
        jobId: job.id,
      });
      throw error;
    }
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed for user ${job.data.user.email}`,
      error,
    );
  }
}
