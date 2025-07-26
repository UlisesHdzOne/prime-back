import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { TranslationKeys } from '../utils/translation-keys';

type ArgsForKeys = {
  [TranslationKeys.AUTH_LOGIN_ATTEMPT]: { email: string };
  [TranslationKeys.AUTH_LOGIN_SUCCESS]: { email: string };
  [TranslationKeys.USER_REGISTRATION_ATTEMPT]: { email: string };
  [TranslationKeys.USER_REGISTRATION_SUCCESS]: { email: string };
  [TranslationKeys.EXCEPTION_USER_NOT_FOUND]: { email: string };
  [TranslationKeys.EXCEPTION_INVALID_CREDENTIALS]: { email?: string };
};

type NoArgsKeys = Exclude<TranslationKeys, keyof ArgsForKeys>;
@Injectable()
export class MessageService {
  constructor(private readonly i18n: I18nService) {}

  private get(key: TranslationKeys, args?: Record<string, any>): string {
    return args ? this.i18n.t(key, { args }) : this.i18n.t(key);
  }

  getTranslatedException(
    key: TranslationKeys,
    lang: string,
    args?: Record<string, any>,
  ) {
    return this.i18n.translate(key, { lang, args });
  }

  emailAlreadyRegistered(): string {
    return this.get(TranslationKeys.EMAIL_ALREADY_REGISTERED);
  }

  invalidCredentials(email?: string): string {
    return email
      ? this.get(TranslationKeys.EXCEPTION_INVALID_CREDENTIALS, { email })
      : this.get(TranslationKeys.EXCEPTION_INVALID_CREDENTIALS);
  }

  authLoginAttempt(email: string): string {
    return this.get(TranslationKeys.AUTH_LOGIN_ATTEMPT, { email });
  }

  authLoginSuccess(email: string): string {
    return this.get(TranslationKeys.AUTH_LOGIN_SUCCESS, { email });
  }

  logoutSuccess(): string {
    return this.get(TranslationKeys.LOGOUT_SUCCESS);
  }

  tokenMissing(): string {
    return this.get(TranslationKeys.TOKEN_MISSING);
  }

  tokenExpired(): string {
    return this.get(TranslationKeys.TOKEN_EXPIRED);
  }

  passwordRequirements(): string {
    return this.get(TranslationKeys.VALIDATION_PASSWORD_STRENGTH);
  }

  internalServerError(): string {
    return this.get(TranslationKeys.EXCEPTION_INTERNAL_SERVER_ERROR);
  }

  userRegistrationAttempt(email: string): string {
    return this.get(TranslationKeys.USER_REGISTRATION_ATTEMPT, { email });
  }

  userRegistrationSuccess(email: string): string {
    return this.get(TranslationKeys.USER_REGISTRATION_SUCCESS, { email });
  }

  userNotFound(email: string): string {
    return this.get(TranslationKeys.EXCEPTION_USER_NOT_FOUND, { email });
  }
}
