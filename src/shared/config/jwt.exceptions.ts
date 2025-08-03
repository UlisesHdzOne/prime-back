import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidJwtConfigException extends HttpException {
  constructor(message: string) {
    super(`JWT Configuration Error: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class WeakSecretException extends InvalidJwtConfigException {
  constructor() {
    super('Secret is too weak. Use a longer, more complex secret');
  }
}
