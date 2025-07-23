import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor() {
    super('Usuario no encontrado', HttpStatus.BAD_REQUEST);
  }
}

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
  }
}

export class UserAlreadyExistsException extends HttpException {
  constructor() {
    super('El usuario ya existe', HttpStatus.CONFLICT);
  }
}

export class TokenExpiredException extends HttpException {
  constructor() {
    super('El token ha expirado', HttpStatus.UNAUTHORIZED);
  }
}

export class TokenMissingException extends HttpException {
  constructor() {
    super('Token faltante', HttpStatus.UNAUTHORIZED);
  }
}

export class TokenRevokedException extends UnauthorizedException {
  constructor(message = 'Token revocado') {
    super(message);
  }
}

export class EmailAlreadyRegisteredException extends HttpException {
  constructor(message?: string) {
    super(message ?? 'El correo ya está registrado', HttpStatus.CONFLICT);
  }
}
