import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    // Headers que NO están cubiertos por Helmet
    if (isProduction) {
      res.setHeader(
        'Permissions-Policy',
        [
          'geolocation=()',
          'microphone=()',
          'camera=()',
          'fullscreen=(self)',
        ].join(', '),
      );
    }

    // Header de versión (personalizado)
    // En security.middleware.ts
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader(
      'X-Api-Version',
      this.configService.get('API_VERSION') || '1.0',
    );

    next();
  }
}
