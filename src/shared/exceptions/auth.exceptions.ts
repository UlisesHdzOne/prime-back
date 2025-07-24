import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UserNotFoundException extends HttpException {
  constructor() {
    super(
      i18nValidationMessage('exceptions.userNotFound'),
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super(
      i18nValidationMessage('exceptions.invalidCredentials'),
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class UserAlreadyExistsException extends HttpException {
  constructor() {
    super(
      i18nValidationMessage('exceptions.userAlreadyExists'),
      HttpStatus.CONFLICT,
    );
  }
}

export class TokenExpiredException extends HttpException {
  constructor() {
    super(
      i18nValidationMessage('exceptions.tokenExpired'),
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class TokenMissingException extends HttpException {
  constructor() {
    super(
      i18nValidationMessage('exceptions.tokenMissing'),
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class TokenRevokedException extends UnauthorizedException {
  constructor() {
    super(i18nValidationMessage('exceptions.tokenRevoked'));
  }
}

export class EmailAlreadyRegisteredException extends HttpException {
  constructor(message?: string) {
    super(
      message ?? i18nValidationMessage('exceptions.emailAlreadyRegistered'),
      HttpStatus.CONFLICT,
    );
  }
}
