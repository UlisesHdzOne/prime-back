import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly allowedOrigins: string[];

  constructor(private readonly configService: ConfigService) {
    this.allowedOrigins =
      this.configService.get('CORS_ALLOWED_ORIGINS')?.split(',') || [];
  }

  use(req: Request, res: Response, next: NextFunction) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    // Headers comunes
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader(
      'X-Api-Version',
      this.configService.get('API_VERSION') || '1.0',
    );

    // Seguridad adicional en producción
    if (isProduction) {
      res.setHeader(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=(), fullscreen=(self)',
      );
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    }

    // CORS dinámico
    const origin = req.headers.origin;
    const devOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
    const allowed = isProduction ? this.allowedOrigins : devOrigins;

    if (origin && allowed.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    next();
  }
}
