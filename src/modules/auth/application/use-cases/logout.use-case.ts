import { Inject, Injectable } from '@nestjs/common';
import { TokenMissingException } from 'src/shared/exceptions/auth.exceptions';
import { IRevokedTokenRepository } from '../../domain/repositories/revoked-token.repository.interface';
import { AppLogger } from 'src/shared/services/app-logger.service';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject('IRevokedTokenRepository')
    private readonly revokedTokenRepository: IRevokedTokenRepository,
    private readonly logger: AppLogger,
  ) {}

  async execute(token: string): Promise<{ message: string }> {
    if (!token) {
      this.logger.warnUser('Token is missing');
      throw new TokenMissingException();
    }

    await this.revokedTokenRepository.revokeToken(token);

    const msg = 'Logout successful';
    this.logger.logUserSuccess(msg);
    return { message: msg };
  }
}
