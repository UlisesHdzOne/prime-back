import { I18nService } from 'nestjs-i18n';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
  constructor(private readonly i18n: I18nService) {}

  logoutSuccess(): string {
    return this.i18n.t('auth.logout.success');
  }
}
