import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CatalogController (e2e)', () => {
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

  describe('GET /api/catalog/products', () => {
    it('returns paginated product list', () => {
      return request(app.getHttpServer())
        .get('/api/catalog/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('totalPages');
        });
    });

    it('accepts page and limit query params', () => {
      return request(app.getHttpServer())
        .get('/api/catalog/products?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.limit).toBe(5);
          expect(res.body.page).toBe(1);
        });
    });

    it('accepts search query param', () => {
      return request(app.getHttpServer())
        .get('/api/catalog/products?search=nike')
        .expect(200);
    });
  });

  describe('GET /api/catalog/products/:slug', () => {
    it('returns 404 for unknown slug', () => {
      return request(app.getHttpServer())
        .get('/api/catalog/products/definitely-not-a-real-product')
        .expect(404);
    });
  });

  describe('GET /api/catalog/categories', () => {
    it('returns array of categories', () => {
      return request(app.getHttpServer())
        .get('/api/catalog/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('POST /api/catalog/products (admin)', () => {
    it('returns 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/api/catalog/products')
        .send({ title: 'Test' })
        .expect(401);
    });
  });
});
