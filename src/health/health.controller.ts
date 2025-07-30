import { Controller, Get } from '@nestjs/common';
import { RedisHealthService } from 'src/health/redis-health.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly redisHealth: RedisHealthService,
  ) {}

  @Get()
  async check() {
    const redisStatus = await this.redisHealth.ping();
    return {
      status: 'OK',
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    };
  }
}