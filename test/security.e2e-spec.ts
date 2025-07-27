import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security Headers', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should include basic security headers', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect('X-Frame-Options', /DENY/i)
      .expect('X-Content-Type-Options', /nosniff/i)
      .expect((res) => {
        if ('x-powered-by' in res.headers) {
          throw new Error('x-powered-by should be removed');
        }
      });
  });

  it('should include production-specific headers in production', async () => {
    // Simula entorno de producción
    process.env.NODE_ENV = 'production';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const prodApp = moduleRef.createNestApplication();
    await prodApp.init();

    await request(prodApp.getHttpServer())
      .get('/')
      .expect('Strict-Transport-Security', /max-age=\d+/)
      .expect('Content-Security-Policy', /default-src 'self'/);

    await prodApp.close();

    // Restaura el entorno
    process.env.NODE_ENV = 'test';
  });
});
