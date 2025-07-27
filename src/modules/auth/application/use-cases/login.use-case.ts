import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  UserNotFoundException,
  InvalidCredentialsException,
  TooManyAttemptsException,
  UserInactiveException,
} from 'src/shared/exceptions/auth.exceptions';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AppLogger } from 'src/shared/services/app-logger.service';
import { LoginDto } from '../dto/login.dto';
import { MessageService } from 'src/shared/services/message.service';
import Redis from 'ioredis';

@Injectable()
export class LoginUseCase {
  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_TIME_SECONDS = 15 * 60;

  constructor(
    @Inject('IUserRepository') private userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly logger: AppLogger,
    private readonly messages: MessageService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  private getKey(email: string): string {
    return `login_attempts:${email}`;
  }

  private async safeRedisOperation<T>(
    operation: () => Promise<T>,
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error('Redis operation failed', error);
      return null;
    }
  }

  private async incrementFailedAttempts(email: string): Promise<number> {
    const result = await this.safeRedisOperation(async () => {
      const key = this.getKey(email);
      const attempts = await this.redisClient.incr(key);
      if (attempts === 1) {
        await this.redisClient.expire(key, this.BLOCK_TIME_SECONDS);
      }
      return attempts;
    });

    return result ?? 0; // manejo explícito de fallback
  }

  private async resetFailedAttempts(email: string) {
    await this.safeRedisOperation(() =>
      this.redisClient.del(this.getKey(email)),
    );
  }

  private async getFailedAttempts(email: string): Promise<number> {
    const attempts = await this.safeRedisOperation(() =>
      this.redisClient.get(this.getKey(email)),
    );
    return Number(attempts) || 0;
  }

  async execute(dto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = dto;

    if (!email || !password) {
      this.logger.warnUser('Login attempt with empty email or password');
      throw new BadRequestException('Email and password are required');
    }

    this.logger.logUserAttempt(this.messages.authLoginAttempt(email));

    const attempts = await this.getFailedAttempts(email);
    if (attempts >= this.MAX_ATTEMPTS) {
      this.logger.warnUser(`Too many failed login attempts for ${email}`);
      throw new TooManyAttemptsException(
        'Too many failed login attempts. Try again later.',
      );
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      await this.incrementFailedAttempts(email);
      this.logger.warnUser(this.messages.userNotFound(email));
      throw new UserNotFoundException(this.messages.userNotFound(email));
    }

    if (!user.isActive) {
      this.logger.warnUser(`Inactive user tried to login: ${email}`);
      throw new UserInactiveException('User account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.incrementFailedAttempts(email);
      this.logger.warnUser(this.messages.invalidCredentials(email));
      throw new InvalidCredentialsException(
        this.messages.invalidCredentials(email),
      );
    }

    await this.resetFailedAttempts(email);

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    this.logger.logUserSuccess(this.messages.authLoginSuccess(email));
    return { access_token: token };
  }
}
