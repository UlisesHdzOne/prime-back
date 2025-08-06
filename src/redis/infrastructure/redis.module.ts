// src/redis/infrastructure/redis.module.ts
import { Module } from '@nestjs/common';
import { RedisService } from '../services/redis.service';
import { RedisConfig } from '../config/redis.config';
import { redisProvider } from '../redis.provider';
import { AppLogger } from 'src/shared/services/app-logger.service';
//import { AppLogger } from '../../shared/logger/app.logger';

@Module({
  providers: [RedisConfig, redisProvider, RedisService, AppLogger,],
  exports: [RedisService],
})
export class RedisModule {}