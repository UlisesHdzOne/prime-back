import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IRevokedTokenRepository } from '../../domain/repositories/revoked-token.repository.interface';
import { AppLogger } from 'src/shared/services/app-logger.service';
import { MessageService } from 'src/shared/services/message.service';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject('IRevokedTokenRepository')
    private readonly revokedTokenRepository: IRevokedTokenRepository,
    private readonly logger: AppLogger,
    private readonly messages: MessageService,
  ) {}

  async execute(token: string): Promise<{ message: string }> {
    if (!token) {
      const msg = await this.messages.tokenMissing();
      this.logger.warnUser(msg);
      throw new UnauthorizedException(msg);
    }

    await this.revokedTokenRepository.revokeToken(token);

    const msg = await this.messages.logoutSuccess();
    this.logger.logUserSuccess(msg);
    return { message: msg };
  }
}
