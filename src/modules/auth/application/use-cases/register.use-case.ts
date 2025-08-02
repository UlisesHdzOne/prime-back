import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
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
    @InjectQueue('breachCheck') private breachCheckQueue: Queue,
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

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User(name, email, hashed);

    const createdUser = await this.userRepository.create(user);

    await this.breachCheckQueue.add({
      user: createdUser,
      password,
    });

    this.logger.logUserSuccess(
      this.messageService.userRegistrationSuccess(email),
    );

    return createdUser;
  }


}
