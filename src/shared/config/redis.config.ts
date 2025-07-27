import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfig {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('REDIS_HOST') || 'localhost';
  }

  get port(): number {
    return Number(this.configService.get<string>('REDIS_PORT')) || 6379;
  }

  get password(): string | undefined {
    return this.configService.get<string>('REDIS_PASSWORD');
  }

  get tls(): boolean {
    return this.configService.get<string>('REDIS_TLS') === 'true';
  }

  get options() {
    return {
      host: this.host,
      port: this.port,
      ...(this.password && { password: this.password }),
      ...(this.tls && { tls: {} }),
    };
  }
}
