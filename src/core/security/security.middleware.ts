import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly allowedOrigins: string[];

  constructor(private readonly configService: ConfigService) {
    // Configuración de orígenes permitidos desde variables de entorno
    this.allowedOrigins =
      this.configService.get('CORS_ALLOWED_ORIGINS')?.split(',') || [];
  }

  use(req: Request, res: Response, next: NextFunction) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    // Headers aplicados en todos los entornos
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader(
      'X-Api-Version',
      this.configService.get('API_VERSION') || '1.0',
    );

    // Configuración específica para producción
    if (isProduction) {
      // Headers de seguridad
      res.setHeader(
        'Permissions-Policy',
        [
          'geolocation=()',
          'microphone=()',
          'camera=()',
          'fullscreen=(self)',
        ].join(', '),
      );

      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

      // CORS dinámico basado en origen solicitante
      const requestOrigin = req.headers.origin;

      if (requestOrigin && this.allowedOrigins.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }

      res.setHeader('Vary', 'Origin');

      // Headers adicionales recomendados
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      );
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      // Configuración flexible para desarrollo
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    next();
  }
}
