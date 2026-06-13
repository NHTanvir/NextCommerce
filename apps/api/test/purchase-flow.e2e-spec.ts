import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Purchase flow (e2e): register → cart → checkout', () => {
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

  it('complete flow: register → login → build anonymous cart → merge on login → attempt checkout', async () => {
    const email = `purchase.flow.${Date.now()}@test.com`;
    const password = 'Secure@1234';

    // 1. Register
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password, name: 'E2E Buyer' });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toHaveProperty('accessToken');

    // 2. Login — verify JWT is issued
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password });
    expect(loginRes.status).toBe(200);
    const token: string = loginRes.body.accessToken;
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // valid JWT shape

    // 3. Get (or create) an anonymous cart
    const cartRes = await request(app.getHttpServer()).get('/api/cart');
    expect(cartRes.status).toBe(200);
    const anonymousToken: string = cartRes.body.anonymousToken;
    expect(typeof anonymousToken).toBe('string');

    // 4. Merge anonymous cart into user account (simulates login flow)
    const mergeRes = await request(app.getHttpServer())
      .post('/api/cart/merge')
      .set('Authorization', `Bearer ${token}`)
      .send({ anonymousToken });
    expect(mergeRes.status).toBe(201);
    const cartId: string = mergeRes.body.id;
    expect(typeof cartId).toBe('string');

    // 5. Attempt to place order from the (empty) cart
    //    Business rule: empty cart → 400
    const orderRes = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ cartId });
    expect([400, 422]).toContain(orderRes.status);
  });

  it('GET /api/orders returns 401 without token', () => {
    return request(app.getHttpServer()).get('/api/orders').expect(401);
  });

  it('GET /api/orders returns empty list for newly registered user', async () => {
    const email = `orders.check.${Date.now()}@test.com`;
    const password = 'Secure@1234';

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password, name: 'Orders Checker' });

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password });
    const token: string = loginRes.body.accessToken;

    const ordersRes = await request(app.getHttpServer())
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(ordersRes.status).toBe(200);
    expect(Array.isArray(ordersRes.body)).toBe(true);
    expect(ordersRes.body.length).toBe(0);
  });
});
