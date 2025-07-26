import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { TranslationKeys } from '../utils/translation-keys';

@Injectable()
export class MessageService {
  constructor(private readonly i18n: I18nService) {}

  /**
   * Traduce una clave definida en TranslationKeys con argumentos opcionales.
   */
  get(key: TranslationKeys, args?: Record<string, any>): string {
    return this.i18n.t(key, { args });
  }

  /** Mensaje de éxito al registrar usuario */
  userRegisteredSuccess(email: string): string {
    return this.get(TranslationKeys.USER_REGISTERED_SUCCESS, { email });
  }

  /** Mensaje de correo ya registrado */
  emailAlreadyRegistered(): string {
    return this.get(TranslationKeys.EMAIL_ALREADY_REGISTERED);
  }

  /** Mensaje de credenciales inválidas */
  invalidCredentials(): string {
    return this.get(TranslationKeys.LOGIN_INVALID_CREDENTIALS);
  }

  /** Mensaje de intento de inicio de sesión */
  authLoginAttempt(email: string): string {
    return this.get(TranslationKeys.AUTH_LOGIN_ATTEMPT, { email });
  }

  /** Mensaje de inicio de sesión exitoso */
  authLoginSuccess(email: string): string {
    return this.get(TranslationKeys.AUTH_LOGIN_SUCCESS, { email });
  }

  /** Mensaje de cierre de sesión exitoso */
  logoutSuccess(): string {
    return this.get(TranslationKeys.LOGOUT_SUCCESS);
  }

  /** Mensaje de token faltante */
  tokenMissing(): string {
    return this.get(TranslationKeys.TOKEN_MISSING);
  }

  /** Mensaje de token expirado */
  tokenExpired(): string {
    return this.get(TranslationKeys.TOKEN_EXPIRED);
  }

  /** Mensaje para la validación de fuerza de contraseña */
  passwordRequirements(): string {
    return this.get(TranslationKeys.VALIDATION_PASSWORD_STRENGTH);
  }

  /** Mensaje de error interno del servidor */
  internalServerError(): string {
    return this.get(TranslationKeys.EXCEPTION_INTERNAL_SERVER_ERROR);
  }

  /** Mensaje de intento de registro de usuario */
  userRegistrationAttempt(email: string): string {
    return this.get(TranslationKeys.USER_REGISTRATION_ATTEMPT, { email });
  }

  /** Mensaje de registro exitoso de usuario */
  userRegistrationSuccess(email: string): string {
    return this.get(TranslationKeys.USER_REGISTRATION_SUCCESS, { email });
  }
}
