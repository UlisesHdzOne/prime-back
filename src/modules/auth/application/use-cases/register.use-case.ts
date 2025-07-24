import { Injectable, Inject } from '@nestjs/common';
import { EmailAlreadyRegisteredException } from 'src/shared/exceptions/auth.exceptions';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/shared/constants';
import { RegisterDto } from '../dto/register.dto';
import { AppLogger } from 'src/shared/services/app-logger.service';
import { MessageService } from 'src/shared/services/message.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    private readonly logger: AppLogger,
    private readonly messages: MessageService,
  ) {}

  async execute(dto: RegisterDto): Promise<User> {
    const { name, email, password } = dto;
    this.logger.logUserAttempt(this.messages.userRegistrationAttempt());
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      this.logger.warnUser(this.messages.emailAlreadyRegistered());
      throw new EmailAlreadyRegisteredException(
        this.messages.emailAlreadyRegistered(),
      );
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User(name, email, hashed);

    const createdUser = await this.userRepository.create(user);
    this.logger.logUserSuccess(this.messages.userRegisteredSuccess(email));

    return createdUser;
  }
}
