import { EmailService } from '../email.service';

describe('EmailService', () => {
  let service: EmailService;
  let sent: Array<{ to: string; subject: string; body: string }>;

  beforeEach(() => {
    service = new EmailService();
    sent = [];
    jest.spyOn(service, 'sendEmail').mockImplementation(async (payload) => {
      sent.push(payload);
    });
  });

  describe('sendOrderPlaced', () => {
    it('uses the user-id-derived to-address and includes total in body', async () => {
      await service.sendOrderPlaced({
        orderId: 'a1b2c3d4-1111-2222-3333-444455556666',
        userId: 'user-42',
        totalCents: 12999,
        placedAt: new Date().toISOString(),
      });

      expect(sent).toHaveLength(1);
      expect(sent[0].to).toBe('user-user-42@nextcommerce.dev');
      expect(sent[0].body).toContain('129.99');
      expect(sent[0].subject).toMatch(/Order Confirmed/i);
    });
  });

  describe('sendOrderShipped', () => {
    it('omits tracking section when not provided', async () => {
      await service.sendOrderShipped({
        orderId: 'aaaa1111bbbb2222cccc3333dddd4444',
        userId: 'u-1',
        shippedAt: new Date().toISOString(),
        trackingNumber: null,
      } as any);

      expect(sent[0].body).not.toMatch(/Tracking:/);
    });

    it('includes the tracking number when provided', async () => {
      await service.sendOrderShipped({
        orderId: 'aaaa1111bbbb2222cccc3333dddd4444',
        userId: 'u-1',
        shippedAt: new Date().toISOString(),
        trackingNumber: '1Z-ABC',
      } as any);

      expect(sent[0].body).toContain('Tracking: 1Z-ABC');
    });
  });

  describe('sendNewsletterWelcome', () => {
    it('targets the subscriber email directly', async () => {
      await service.sendNewsletterWelcome('alice@example.com');
      expect(sent[0].to).toBe('alice@example.com');
      expect(sent[0].subject).toMatch(/Newsletter/i);
    });
  });

  describe('sendOrderPaid', () => {
    it('confirms payment in the subject', async () => {
      await service.sendOrderPaid({
        orderId: 'a1b2c3d4-1111-2222-3333-444455556666',
        userId: 'u-1',
        paidAt: new Date().toISOString(),
      } as any);

      expect(sent[0].subject).toMatch(/Payment Confirmed/i);
    });
  });
});
