import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IRevokedTokenRepository } from '../../domain/repositories/revoked-token.repository';

@Injectable()
export class PrismaRevokedTokenRepository implements IRevokedTokenRepository {
  constructor(private prisma: PrismaService) {}

  async revokeToken(token: string): Promise<void> {
    await this.prisma.revokedToken.create({
      data: {
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 día, ajusta según JWT
      },
    });
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    const found = await this.prisma.revokedToken.findUnique({
      where: { token },
    });
    return !!found;
  }
}
