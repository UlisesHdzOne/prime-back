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
    private readonly messageService: MessageService,
  ) {}

  async execute(token: string): Promise<{ message: string }> {
    if (!token) {
      const errorMessage = this.messageService.tokenMissing();
      this.logger.warnUser(errorMessage);
      throw new TokenMissingException();
    }

    await this.revokedTokenRepository.revokeToken(token);

    const msg = this.messageService.logoutSuccess();
    this.logger.logUserSuccess(msg);
    return { message: msg };
  }
}
