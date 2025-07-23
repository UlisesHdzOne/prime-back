import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IRevokedTokenRepository } from '../../domain/repositories/revoked-token.repository.interface';
import { RevokedToken } from '../../domain/entities/revoked-token.entity';

@Injectable()
export class PrismaRevokedTokenRepository implements IRevokedTokenRepository {
  constructor(private prisma: PrismaService) {}

  async revokeToken(token: string): Promise<void> {
    await this.prisma.revokedToken.create({
      data: {
        token,
        revokedAt: new Date(),
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

  async findToken(token: string): Promise<RevokedToken | null> {
    const found = await this.prisma.revokedToken.findUnique({
      where: { token },
    });
    if (!found) return null;

    return new RevokedToken(
      found.token,
      found.revokedAt,
      found.expiresAt,
      found.id,
    );
  }

  async deleteToken(token: string): Promise<void> {
    await this.prisma.revokedToken.deleteMany({
      where: { token },
    });
  }
}
