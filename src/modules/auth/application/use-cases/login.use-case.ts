import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
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
@Injectable()
export class LoginUseCase {
  private failedAttempts = new Map<string, number>();
  private MAX_ATTEMPTS = 5;

  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly logger: AppLogger,
    private readonly messages: MessageService,
  ) {}

  private incrementFailedAttempts(email: string) {
    const attempts = this.failedAttempts.get(email) || 0;
    this.failedAttempts.set(email, attempts + 1);
  }

  private resetFailedAttempts(email: string) {
    this.failedAttempts.delete(email);
  }

  async execute(dto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = dto;

    if (!email || !password) {
      this.logger.warnUser('Login attempt with empty email or password');
      throw new BadRequestException('Email and password are required');
    }

    this.logger.logUserAttempt(this.messages.authLoginAttempt(email));

    const attempts = this.failedAttempts.get(email) || 0;
    if (attempts >= this.MAX_ATTEMPTS) {
      this.logger.warnUser(`Too many failed login attempts for ${email}`);
      throw new TooManyAttemptsException(
        'Too many failed login attempts. Try again later.',
      );
    }

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.incrementFailedAttempts(email);
      this.logger.warnUser(this.messages.userNotFound(email));
      throw new UserNotFoundException(this.messages.userNotFound(email));
    }

    if (!user.isActive) {
      this.logger.warnUser(`Inactive user tried to login: ${email}`);
      throw new UserInactiveException('User account is inactive');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.incrementFailedAttempts(email);
      this.logger.warnUser(this.messages.invalidCredentials(email));
      throw new InvalidCredentialsException(
        this.messages.invalidCredentials(email),
      );
    }

    this.resetFailedAttempts(email);

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    this.logger.logUserSuccess(this.messages.authLoginSuccess(email));
    return { access_token: token };
  }
}
