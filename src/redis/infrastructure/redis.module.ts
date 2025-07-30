// src/redis/infrastructure/redis.module.ts
import { Module } from '@nestjs/common';
import { redisProvider } from '../redis.provider';
import { RedisService } from '../services/redis.service';
import { ConfigModule } from '@nestjs/config';
import { RedisHealthService } from 'src/health/redis-health.service';
import { RedisConfig } from '../config/redis.config';

@Module({
  imports: [ConfigModule],
  providers: [RedisService,RedisHealthService,RedisConfig],
  exports: [RedisService,RedisHealthService],
})
export class RedisModule {}
