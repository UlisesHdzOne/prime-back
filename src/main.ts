import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Espera inicial para dependencias (evita errores de conexión en entornos locales)
    if (process.env.NODE_ENV !== 'test') {
      logger.log('Esperando 5 segundos por servicios dependientes...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
      bufferLogs: true,
    });

    const configService = app.get(ConfigService);

    // Filtro global para manejar excepciones personalizadas
    app.useGlobalFilters(app.get(AllExceptionsFilter));

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
