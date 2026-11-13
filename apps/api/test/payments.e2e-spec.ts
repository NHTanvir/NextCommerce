import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Payments (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/payments/webhook/stripe', () => {
    it('returns 400 when signature is missing and secret is not test', () => {
      const payload = JSON.stringify({
        type: 'payment_intent.succeeded',
        id: 'evt_1',
        data: { object: { id: 'pi_1' } },
      });
      return request(app.getHttpServer())
        .post('/api/payments/webhook/stripe')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', 'bad_signature')
        .send(payload)
        .expect(400);
    });

    it('returns 200 when signature matches (using whsec_test bypass)', () => {
      const payload = JSON.stringify({
        type: 'charge.refunded',
        id: 'evt_test_1',
        data: { object: { id: 'ch_test_1' } },
      });
      return request(app.getHttpServer())
        .post('/api/payments/webhook/stripe')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', 'any')
        .send(payload)
        .expect(200)
        .expect({ received: true });
    });
  });
});
