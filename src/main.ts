import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/services/redis.service';
import * as express from 'express';
import * as path from 'path';

async function waitForService(
  checkFn: () => Promise<boolean>,
  retries = 10,
  delayMs = 1000,
  serviceName = 'service',
) {
  for (let i = 0; i < retries; i++) {
    try {
      if (await checkFn()) return;
    } catch {}
    console.log(
      `${serviceName} no listo, reintentando... (${i + 1}/${retries})`,
    );
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`${serviceName} no respondió a tiempo`);
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
      bufferLogs: true,
    });

    const configService = app.get(ConfigService);
    const redisService = app.get(RedisService); // ← obtiene tu servicio
    const redisClient = redisService.getClient(); // ← obtiene el cliente ioredis
    const prismaService = app.get(PrismaService);

    logger.log('Esperando servicios...');

    await waitForService(
      async () => {
        const pong = await redisClient.ping();
        return pong === 'PONG';
      },
      10,
      1000,
      'Redis',
    );

    await waitForService(
      async () => {
        await prismaService.$queryRaw`SELECT 1`;
        return true;
      },
      10,
      1000,
      'Postgres',
    );

    logger.log('Servicios listos, arrancando aplicación');

    app.useGlobalFilters(app.get(GlobalExceptionFilter));

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: configService.get('NODE_ENV') === 'production',
      }),
    );

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

    app.use(helmet.frameguard({ action: 'deny' }));
    app.use(helmet.noSniff());
    app.use(helmet.hidePoweredBy());

    if (isProduction) {
      app.use(
        helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
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
          crossOriginEmbedderPolicy: true,
          crossOriginOpenerPolicy: { policy: 'same-origin' },
          crossOriginResourcePolicy: { policy: 'same-origin' },
          referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
          frameguard: { action: 'deny' },
          noSniff: true,
          xssFilter: true,
          permittedCrossDomainPolicies: { permittedPolicies: 'none' },
        }),
      );

      app.use(
        rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 100,
          message:
            'Demasiadas solicitudes desde esta IP, intenta nuevamente más tarde',
          skip: (req) => req.path === '/health',
        }),
      );
    } else {
      app.use(helmet.noSniff());
      app.use(helmet.frameguard({ action: 'deny' }));
    }

    app.use(
      '/favicon.ico',
      express.static(path.join(__dirname, '..', 'public', 'favicon.ico')),
    );

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
