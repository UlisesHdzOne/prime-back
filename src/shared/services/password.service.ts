import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PasswordService {
  getSha1Hash(password: string): string {
    return crypto
      .createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();
  }
}
