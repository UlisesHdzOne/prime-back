import { Injectable, Inject } from '@nestjs/common';
import {
  UserNotFoundException,
  InvalidCredentialsException,
} from 'src/shared/exceptions/auth.exceptions';

import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AppLogger } from 'src/shared/services/app-logger.service';
import { MessageService } from 'src/shared/services/message.service';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly logger: AppLogger,
    private readonly messages: MessageService,
  ) {}

  async execute(dto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = dto;
    this.logger.logUserAttempt(`Intento de login para: ${email}`);

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.logger.warnUser(this.messages.userNotFound());
      throw new UserNotFoundException();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warnUser(this.messages.invalidCredentials());
      throw new InvalidCredentialsException();
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    this.logger.logUserSuccess(`Login exitoso para: ${email}`);
    return { access_token: token };
  }
}
