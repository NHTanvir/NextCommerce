import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentsService, StripeWebhookEvent } from '../payments.service';
import { Order } from '../../orders/entities/order.entity';
import { EventsService } from '../../events/events.service';
import { AuditService } from '../../audit/audit.service';

const mockOrderRepo = {
  findOne: jest.fn(),
  update: jest.fn(),
};

const mockEventsService = { publish: jest.fn() };
const mockAuditService = { log: jest.fn() };

function makeEvent(type: string, overrides: Partial<StripeWebhookEvent['data']['object']> = {}): StripeWebhookEvent {
  return {
    id: 'evt_test',
    type,
    data: {
      object: {
        id: 'pi_test',
        metadata: { orderId: 'order-uuid' },
        amount_received: 5999,
        status: 'succeeded',
        ...overrides,
      },
    },
  };
}

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: EventsService, useValue: mockEventsService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();
    service = module.get(PaymentsService);
  });

  describe('handleStripeWebhook', () => {
    it('routes payment_intent.succeeded', async () => {
      const order = { id: 'order-uuid', userId: 'user-1' };
      mockOrderRepo.findOne.mockResolvedValue(order);
      mockOrderRepo.update.mockResolvedValue({});
      mockEventsService.publish.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.handleStripeWebhook(makeEvent('payment_intent.succeeded'));

      expect(mockOrderRepo.update).toHaveBeenCalledWith('order-uuid', expect.objectContaining({ status: 'paid' }));
      expect(mockEventsService.publish).toHaveBeenCalledWith('order.paid', expect.any(Object));
    });

    it('routes payment_intent.payment_failed', async () => {
      mockAuditService.log.mockResolvedValue(undefined);
      await service.handleStripeWebhook(makeEvent('payment_intent.payment_failed'));
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('routes charge.refunded', async () => {
      mockAuditService.log.mockResolvedValue(undefined);
      await service.handleStripeWebhook(makeEvent('charge.refunded'));
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('silently ignores unhandled event types', async () => {
      await service.handleStripeWebhook(makeEvent('customer.created'));
      expect(mockOrderRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('handlePaymentSucceeded', () => {
    it('warns and returns when orderId is missing in metadata', async () => {
      const event = makeEvent('payment_intent.succeeded', { metadata: {} });
      await service.handleStripeWebhook(event);
      expect(mockOrderRepo.findOne).not.toHaveBeenCalled();
    });

    it('logs error and returns when order is not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);
      await service.handleStripeWebhook(makeEvent('payment_intent.succeeded'));
      expect(mockOrderRepo.update).not.toHaveBeenCalled();
    });

    it('updates order status and publishes event on success', async () => {
      const order = { id: 'order-uuid', userId: 'user-42' };
      mockOrderRepo.findOne.mockResolvedValue(order);
      mockOrderRepo.update.mockResolvedValue({});
      mockEventsService.publish.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await service.handleStripeWebhook(makeEvent('payment_intent.succeeded'));

      expect(mockOrderRepo.update).toHaveBeenCalledWith('order-uuid', {
        status: 'paid',
        paymentRef: 'pi_test',
      });
      expect(mockEventsService.publish).toHaveBeenCalledWith('order.paid', {
        orderId: 'order-uuid',
        userId: 'user-42',
        paidAt: expect.any(String),
      });
    });
  });

  describe('verifyWebhookSignature', () => {
    it('returns true when secret is whsec_test (dev mode)', () => {
      expect(service.verifyWebhookSignature('payload', 'sig', 'whsec_test')).toBe(true);
    });

    it('returns true when secret is empty', () => {
      expect(service.verifyWebhookSignature('payload', 'sig', '')).toBe(true);
    });

    it('returns false when signature header is missing parts', () => {
      expect(service.verifyWebhookSignature('payload', 'invalid', 'whsec_real')).toBe(false);
    });

    it('returns false when computed hmac does not match', () => {
      const sig = 't=1234,v1=badhash';
      expect(service.verifyWebhookSignature('body', sig, 'whsec_real')).toBe(false);
    });

    it('computes correct signature and returns true', () => {
      const crypto = require('crypto');
      const secret = 'whsec_real';
      const timestamp = '1700000000';
      const payload = 'test-body';
      const signed = `${timestamp}.${payload}`;
      const computed = crypto.createHmac('sha256', secret).update(signed).digest('hex');
      const sig = `t=${timestamp},v1=${computed}`;
      expect(service.verifyWebhookSignature(payload, sig, secret)).toBe(true);
    });
  });
});
