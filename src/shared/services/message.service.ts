import { I18nService } from 'nestjs-i18n';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
  constructor(private readonly i18n: I18nService) {}

  emailAlreadyRegistered(): string {
    return this.i18n.t('auth.registration.emailAlreadyRegistered');
  }

  userRegistrationAttempt():string {
    return this.i18n.t('auth.registration.attempt');
  }

  userRegisteredSuccess(email: string):string {
    return this.i18n.t('auth.registration.success', {
      args: { email },
    });
  }

  userNotFound(): string {
    return this.i18n.t('auth.exceptions.userNotFound');
  }

  invalidCredentials():string {
    return this.i18n.t('auth.login.invalidCredentials');
  }

   logoutSuccess(): string {
    return this.i18n.t('auth.logout.success');
  }

  tokenMissing():string {
    return this.i18n.t('auth.token.missing');
  }
}
