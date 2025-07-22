import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // para eliminar propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // lanza error si hay propiedades extras
      transform: true, // convierte payload a instancias de clase DTO
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('document-api')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;
  await app.listen(port);
}
bootstrap();
