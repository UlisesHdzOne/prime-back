import { Module, Global } from '@nestjs/common';
import { JwtConfigService } from './jwt-config.service';

@Global()
@Module({
  providers: [
    JwtConfigService,
    {
      provide: 'JWT_CONFIG',
      useFactory: (jwtConfigService: JwtConfigService) =>
        jwtConfigService.getJwtConfig(),
      inject: [JwtConfigService],
    },
  ],
  exports: ['JWT_CONFIG', JwtConfigService],
})
export class JwtConfigModule {}
