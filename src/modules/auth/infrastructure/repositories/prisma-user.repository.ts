import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const { name, email, password } = user;
    const created = await this.prisma.user.create({
      data: { name, email, password },
    });
    return new User(name, email, password, created.id);
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { email } });
    if (!found) return null;
    const { name, password, id } = found;
    return new User(name, email, password, id);
  }
}
