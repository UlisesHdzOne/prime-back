import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
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
      const msg = await this.messages.userNotFound();
      this.logger.warnUser(msg);
      throw new BadRequestException(msg);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const msg = await this.messages.invalidCredentials();
      this.logger.warnUser(msg);
      throw new UnauthorizedException(msg);
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    this.logger.logUserSuccess(`Login exitoso para: ${email}`);
    return { access_token: token };
  }
}
