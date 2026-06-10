import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentsController } from '../payments.controller';
import { PaymentsService } from '../payments.service';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

const mockService: Partial<PaymentsService> = {
  verifyWebhookSignature: jest.fn().mockReturnValue(true),
  handleStripeWebhook: jest.fn().mockResolvedValue(undefined),
};

const mockConfig = {
  get: jest.fn().mockReturnValue('whsec_test'),
};

function makeReq(body: object, rawBody?: Buffer): RawBodyRequest<Request> {
  return { body, rawBody } as unknown as RawBodyRequest<Request>;
}

describe('PaymentsController', () => {
  let controller: PaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: mockService },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    controller = module.get(PaymentsController);
    jest.clearAllMocks();
  });

  it('stripeWebhook() returns { received: true } on valid signature', async () => {
    (mockService.verifyWebhookSignature as jest.Mock).mockReturnValue(true);
    const req = makeReq({ type: 'checkout.session.completed' });
    const result = await controller.stripeWebhook(req, 'sig_valid');
    expect(result).toEqual({ received: true });
    expect(mockService.handleStripeWebhook).toHaveBeenCalled();
  });

  it('stripeWebhook() throws BadRequestException on invalid signature', async () => {
    (mockService.verifyWebhookSignature as jest.Mock).mockReturnValue(false);
    const req = makeReq({ type: 'payment_intent.created' });
    await expect(controller.stripeWebhook(req, 'bad_sig')).rejects.toThrow(BadRequestException);
    expect(mockService.handleStripeWebhook).not.toHaveBeenCalled();
  });

  it('stripeWebhook() uses rawBody when available for verification', async () => {
    const rawBody = Buffer.from('{"type":"payment_intent.succeeded"}');
    (mockService.verifyWebhookSignature as jest.Mock).mockReturnValue(true);
    const req = makeReq({ type: 'payment_intent.succeeded' }, rawBody);
    await controller.stripeWebhook(req, 'sig_valid');
    expect(mockService.verifyWebhookSignature).toHaveBeenCalledWith(rawBody, 'sig_valid', 'whsec_test');
  });
});
