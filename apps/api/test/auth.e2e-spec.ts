import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('rejects missing email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ password: 'SecurePass1!' })
        .expect(400);
    });

    it('rejects invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'SecurePass1!', name: 'Test' })
        .expect(400);
    });

    it('rejects short password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'abc', name: 'Test' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('rejects missing credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });

    it('returns 401 for wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'WrongPassword1!' })
        .expect(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });

    it('returns 401 with malformed token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer not.a.valid.token')
        .expect(401);
    });
  });
});
