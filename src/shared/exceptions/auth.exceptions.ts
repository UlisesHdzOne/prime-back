import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UserNotFoundException extends HttpException {
  constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          message ?? i18nValidationMessage('exceptions.UserNotFoundException'),
        error: 'User Not Found',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidCredentialsException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        error: 'Invalid Credentials',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class UserAlreadyExistsException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: i18nValidationMessage('exceptions.userAlreadyExists'),
        error: 'User Already Exists',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class TokenExpiredException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: i18nValidationMessage('exceptions.tokenExpired'),
        error: 'Token Expired',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class TokenMissingException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: i18nValidationMessage('exceptions.tokenMissing'),
        error: 'Token Missing',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class TokenRevokedException extends UnauthorizedException {
  constructor() {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: i18nValidationMessage('exceptions.tokenRevoked'),
      error: 'Token Revoked',
    });
  }
}

export class EmailAlreadyRegisteredException extends HttpException {
  constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message:
          message ?? i18nValidationMessage('exceptions.emailAlreadyRegistered'),
        error: 'Email Already Registered',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidJwtConfigException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
        error: 'Invalid JWT Configuration',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class WeakSecretException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: i18nValidationMessage('exceptions.jwt.weakSecret'),
        error: 'Weak JWT Secret',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class InvalidExpiresInFormatException extends HttpException {
  constructor(details: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: i18nValidationMessage('exceptions.jwt.invalidExpiresIn'),
        error: 'Invalid ExpiresIn Format',
        details,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class TooManyAttemptsException extends HttpException {
  constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: message ?? i18nValidationMessage('exceptions.tooManyAttempts'),
        error: 'Too Many Attempts',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export class UserInactiveException extends HttpException {
  constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: message ?? i18nValidationMessage('exceptions.userInactive'),
        error: 'User Inactive',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
