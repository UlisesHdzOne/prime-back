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
    const redisService = app.get(RedisService);
    const redisClient = redisService.getClient();
    const prismaService = app.get(PrismaService);

    logger.log('Esperando servicios...');

    await waitForService(
      async () => (await redisClient.ping()) === 'PONG',
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

    // Registra BullBoard aquí
    const { QueueDashboardModule } = await import(
      './queue-dashboard/queue-dashboard.module'
    );
    const dashboardModule = new QueueDashboardModule(app);
    await dashboardModule.onModuleInit();

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

    // Helmet (una sola vez)
    app.use(
      helmet({
        contentSecurityPolicy: isProduction
          ? {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:'],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                frameSrc: ["'none'"],
                formAction: ["'self'"],
              },
            }
          : false,
        hsts: isProduction
          ? {
              maxAge: 63072000,
              includeSubDomains: true,
              preload: true,
            }
          : false,
        crossOriginEmbedderPolicy: isProduction,
        crossOriginOpenerPolicy: isProduction
          ? { policy: 'same-origin' }
          : false,
        crossOriginResourcePolicy: isProduction
          ? { policy: 'same-origin' }
          : false,
        referrerPolicy: isProduction
          ? { policy: 'strict-origin-when-cross-origin' }
          : false,
        frameguard: { action: 'deny' },
        noSniff: true,
        hidePoweredBy: true,
        xssFilter: true,
        permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      }),
    );

    // Rate limit solo en producción
    if (isProduction) {
      app.use(
        rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 100,
          message:
            'Demasiadas solicitudes desde esta IP, intenta nuevamente más tarde',
          skip: (req) => req.path === '/health',
        }),
      );
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
