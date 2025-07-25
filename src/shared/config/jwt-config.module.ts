import { Module, Global } from '@nestjs/common';
import { JwtProviderService } from './JwtProviderService';

@Global()
@Module({
  providers: [
    JwtProviderService,
    {
      provide: 'JWT_CONFIG',
      useFactory: (jwtProviderService: JwtProviderService) =>
        jwtProviderService.getConfig(),
      inject: [JwtProviderService],
    },
  ],
  exports: ['JWT_CONFIG', JwtProviderService],
})
export class JwtConfigModule {}
