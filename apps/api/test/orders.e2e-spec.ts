import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.setGlobalPrefix('api');
    await app.init();

    // Register & login as customer
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'orders.e2e.customer@test.com', password: 'Test@1234', name: 'E2E Customer' });

    const customerRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'orders.e2e.customer@test.com', password: 'Test@1234' });
    customerToken = customerRes.body.accessToken;

    // Register & login as admin (if admin user exists)
    const adminRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@nextcommerce.dev', password: 'Admin@123456' });
    adminToken = adminRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/orders', () => {
    it('returns 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/api/orders')
        .send({ items: [], addressLine1: '123 Main St', city: 'NYC', postalCode: '10001', country: 'US' })
        .expect(401);
    });

    it('returns 400 with empty items array', () => {
      return request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ items: [], addressLine1: '123 Main St', city: 'NYC', postalCode: '10001', country: 'US' })
        .expect(400);
    });
  });

  describe('GET /api/orders', () => {
    it('returns 401 without auth', () => {
      return request(app.getHttpServer()).get('/api/orders').expect(401);
    });

    it('returns order list for authenticated customer', () => {
      return request(app.getHttpServer())
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /api/orders/admin', () => {
    it('returns 403 for non-admin', () => {
      return request(app.getHttpServer())
        .get('/api/orders/admin')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('returns all orders for admin', async () => {
      if (!adminToken) return; // skip if admin not seeded
      return request(app.getHttpServer())
        .get('/api/orders/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
