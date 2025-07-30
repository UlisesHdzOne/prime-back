import { Module } from '@nestjs/common';
import { RedisHealthService } from './redis-health.service';
import { HealthController } from './health.controller';
import { RedisModule } from 'src/redis/infrastructure/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [HealthController],
  providers: [RedisHealthService],
})
export class HealthModule {}
