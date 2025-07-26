import { Inject, Injectable } from '@nestjs/common';
import { TokenMissingException } from 'src/shared/exceptions/auth.exceptions';
import { IRevokedTokenRepository } from '../../domain/repositories/revoked-token.repository.interface';
import { AppLogger } from 'src/shared/services/app-logger.service';
import { MessageService } from 'src/shared/services/message.service';
import { TranslationKeys } from 'src/shared/utils/translation-keys';

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
      const errorMessage = this.messageService.get(
        TranslationKeys.TOKEN_MISSING,
      );
      this.logger.warnUser(errorMessage);
      throw new TokenMissingException();
    }

    await this.revokedTokenRepository.revokeToken(token);

    const msg = this.messageService.get(TranslationKeys.LOGOUT_SUCCESS);
    this.logger.logUserSuccess(msg);
    return { message: msg };
  }
}
