import { Module } from '@nestjs/common';
import { RedisHealthService } from '../shared/services/redis-health.service';
import { HealthController } from './health.controller';
import { RedisModule } from 'src/shared/infrastructure/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [HealthController],
  providers: [RedisHealthService],
})
export class HealthModule {}
