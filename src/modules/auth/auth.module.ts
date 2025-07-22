import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [PrismaModule, SharedModule],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
  ],
})
export class AuthModule {}
