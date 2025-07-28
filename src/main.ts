import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
//import { AllExceptionsFilter } from './shared/filters/http-exception.filter';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Espera inicial para dependencias (evita errores de conexión en entornos locales)
    if (process.env.NODE_ENV !== 'test') {
      logger.log('Esperando 5 segundos por servicios dependientes...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
      bufferLogs: true,
    });

    const configService = app.get(ConfigService);

    // Filtro global para manejar excepciones personalizadas
    app.useGlobalFilters(app.get(GlobalExceptionFilter));

    // Validación global
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: configService.get('NODE_ENV') === 'production',
      }),
    );

    // Documentación Swagger (solo si no es producción)
    if (configService.get('NODE_ENV') !== 'production') {
      const swaggerConfig = new DocumentBuilder()
        .setTitle('Auth API')
        .setDescription('Documentación de la API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, swaggerConfig);
      SwaggerModule.setup('api', app, document);
      logger.log('Swagger disponible en /api');
    }

    const isProduction = configService.get('NODE_ENV') === 'production';

    // Helmet básico para todos los entornos
    app.use(helmet.frameguard({ action: 'deny' }));
    app.use(helmet.noSniff());
    app.use(helmet.hidePoweredBy());

    // Helmet avanzado y rate limit solo en producción
    if (isProduction) {
      app.use(
        helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Solo en desarrollo
                "'unsafe-eval'", 
              ],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:'],
              connectSrc: ["'self'"],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              frameSrc: ["'none'"],
              formAction: ["'self'"],
            },
          },
          hsts: {
            maxAge: 63072000,
            includeSubDomains: true,
            preload: true,
          },
          crossOriginEmbedderPolicy: true, // Nuevo
          crossOriginOpenerPolicy: { policy: 'same-origin' }, // Nuevo
          crossOriginResourcePolicy: { policy: 'same-origin' }, // Nuevo
          referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
          frameguard: { action: 'deny' },
          noSniff: true,
          xssFilter: true, // Nuevo
          permittedCrossDomainPolicies: { permittedPolicies: 'none' }, // Nuevo
        }),
      );

      app.use(
        rateLimit({
          windowMs: 15 * 60 * 1000, // 15 minutos
          max: isProduction ? 100 : 1000,
          message:
            'Demasiadas solicitudes desde esta IP, intenta nuevamente más tarde',
              skip: (req) => req.path === '/health'
        }),
      );
    } else {
      // Configuración mínima para desarrollo
      app.use(helmet.noSniff());
      app.use(helmet.frameguard({ action: 'deny' }));
    }

    // Arranque del servidor
    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port);
    logger.log(`Aplicación corriendo en: http://localhost:${port}`);
    logger.log(`Entorno: ${configService.get('NODE_ENV')}`);
  } catch (error) {
    logger.error('Error al iniciar la aplicación', error.stack);
    process.exit(1);
  }
}

bootstrap();
