import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { RegisterDto } from '../dto/register.dto';

import { AppLogger } from 'src/shared/services/app-logger.service';
import { MessageService } from 'src/shared/services/message.service';
import {
  EmailAlreadyRegisteredException,
  PasswordBreachedException,
} from 'src/shared/exceptions/auth.exceptions';
import { SALT_ROUNDS } from 'src/shared/constants';
import * as crypto from 'crypto';
@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    private readonly logger: AppLogger,
    private readonly messageService: MessageService,
  ) {}

  async execute(dto: RegisterDto): Promise<User> {
    const { name, email, password } = dto;

    this.logger.logUserAttempt(
      this.messageService.userRegistrationAttempt(email),
    );

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      const msg = this.messageService.emailAlreadyRegistered();
      this.logger.warn(msg);
      throw new EmailAlreadyRegisteredException(msg);
    }

    const isBreached = await this.isPasswordBreached(password);
    if (isBreached) {
      const msg = this.messageService.passwordBreached();
      this.logger.warn(msg);
      throw new PasswordBreachedException(msg);
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User(name, email, hashed);

    const createdUser = await this.userRepository.create(user);

    this.logger.logUserSuccess(
      this.messageService.userRegistrationSuccess(email),
    );

    return createdUser;
  }

  private async isPasswordBreached(password: string): Promise<boolean> {
    try {
      const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5).toUpperCase();

      const { data } = await axios.get(
        `https://api.pwnedpasswords.com/range/${prefix}`,
      );

      return data.split('\n').some((line: string) => line.startsWith(suffix));
    } catch (error) {
      this.logger.error('Error checking password breach', error);
      return false;
    }
  }
}
