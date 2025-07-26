import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { TranslationKeys } from '../utils/translation-keys';

@Injectable()
export class MessageService {
  constructor(private readonly i18n: I18nService) {}

  // En MessageService
  get(key: TranslationKeys | string, args?: Record<string, any>): string {
    return this.i18n.t(key, { args });
  }

  userRegisteredSuccess(email: string): string {
    return this.get(TranslationKeys.USER_REGISTERED_SUCCESS, { email });
  }

  emailAlreadyRegistered(): string {
    return this.get(TranslationKeys.EMAIL_ALREADY_REGISTERED);
  }

  invalidCredentials(): string {
    return this.get(TranslationKeys.LOGIN_INVALID_CREDENTIALS);
  }

  logoutSuccess(): string {
    return this.get(TranslationKeys.LOGOUT_SUCCESS);
  }

  tokenMissing(): string {
    return this.get(TranslationKeys.TOKEN_MISSING);
  }

  passwordStrength(): string {
    return this.get(TranslationKeys.VALIDATION_PASSWORD_STRENGTH);
  }
}
