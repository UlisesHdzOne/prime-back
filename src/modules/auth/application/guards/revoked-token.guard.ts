import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaRevokedTokenRepository } from 'src/modules/auth/infrastructure/repositories/revoked-token.repository';

@Injectable()
export class RevokedTokenGuard implements CanActivate {
  constructor(private revokedTokenRepo: PrismaRevokedTokenRepository) {}

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
