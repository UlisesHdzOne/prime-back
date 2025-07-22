import { I18nService } from 'nestjs-i18n';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
  constructor(
    private readonly i18n: I18nService
  ) {}

  emailAlreadyRegistered(): Promise<string> {
    return this.i18n.t('EMAIL_ALREADY_REGISTERED');
  }

  userRegistrationAttempt(): Promise<string> {
    return this.i18n.t('USER_REGISTRATION_ATTEMPT');
  }

  userRegisteredSuccess(email: string): Promise<string> {
    return this.i18n.t('USER_REGISTERED_SUCCESS', {
      args: { email },
    });
  }
}
