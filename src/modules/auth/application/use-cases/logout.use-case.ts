import { Inject, Injectable } from '@nestjs/common';
import { TokenMissingException } from 'src/shared/exceptions/auth.exceptions';
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
      this.logger.warnUser(await this.messages.tokenMissing());
      throw new TokenMissingException();
    }

    await this.revokedTokenRepository.revokeToken(token);

    const msg = await this.messages.logoutSuccess();
    this.logger.logUserSuccess(msg);
    return { message: msg };
  }
}
