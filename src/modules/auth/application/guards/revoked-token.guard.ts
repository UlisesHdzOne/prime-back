import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { IRevokedTokenRepository } from '../../domain/repositories/revoked-token.repository.interface';

@Injectable()
export class RevokedTokenGuard implements CanActivate {
  constructor(
    @Inject('IRevokedTokenRepository')
    private revokedTokenRepo: IRevokedTokenRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Token faltante');
    }

    const token = authHeader.replace('Bearer ', '');
    const revokedToken = await this.revokedTokenRepo.findToken(token);

    if (revokedToken) {
      if (new Date() >= revokedToken.expiresAt) {
        await this.revokedTokenRepo.deleteToken(token);
      } else {
        throw new UnauthorizedException('Token revocado');
      }
    }

    return true;
  }
}
