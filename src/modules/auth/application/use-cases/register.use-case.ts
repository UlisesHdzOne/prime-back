import { Injectable, Inject } from '@nestjs/common';
import { EmailAlreadyRegisteredException } from 'src/shared/exceptions/auth.exceptions';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/shared/constants';
import { RegisterDto } from '../dto/register.dto';
import { AppLogger } from 'src/shared/services/app-logger.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    private readonly logger: AppLogger,
  ) {}

  async execute(dto: RegisterDto): Promise<User> {
    const { name, email, password } = dto;
    this.logger.logUserAttempt(`User registration attempt: ${email}`);
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      const warnMsg = `Email already registered: ${email}`;
      this.logger.warnUser(warnMsg);
      throw new EmailAlreadyRegisteredException(warnMsg);
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User(name, email, hashed);

    const createdUser = await this.userRepository.create(user);
    this.logger.logUserSuccess(`User registered successfully: ${email}`);

    return createdUser;
  }
}
