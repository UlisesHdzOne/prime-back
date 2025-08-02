import { Module, OnModuleInit } from '@nestjs/common';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { INestApplication } from '@nestjs/common';

@Module({})
export class QueueDashboardModule implements OnModuleInit {
  constructor(private readonly app: INestApplication) {}

  onModuleInit() {
    const adapter = new ExpressAdapter();
    adapter.setBasePath('/admin/queues');

    const breachCheckQueue = this.app.get<Queue>(getQueueToken('breachCheck'));

    createBullBoard({
      queues: [new BullAdapter(breachCheckQueue)],
      serverAdapter: adapter,
    });

    this.app.use('/admin/queues', adapter.getRouter());
    console.log('BullBoard disponible en /admin/queues');
  }
}
