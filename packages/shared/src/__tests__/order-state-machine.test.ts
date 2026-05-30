import { ORDER_STATUS_TRANSITIONS } from '../types/order.types';
import type { OrderStatus } from '../types/order.types';

describe('ORDER_STATUS_TRANSITIONS', () => {
  it('allows pending → paid', () => {
    expect(ORDER_STATUS_TRANSITIONS['pending']).toContain('paid');
  });

  it('allows pending → cancelled', () => {
    expect(ORDER_STATUS_TRANSITIONS['pending']).toContain('cancelled');
  });

  it('allows paid → processing', () => {
    expect(ORDER_STATUS_TRANSITIONS['paid']).toContain('processing');
  });

  it('allows processing → shipped', () => {
    expect(ORDER_STATUS_TRANSITIONS['processing']).toContain('shipped');
  });

  it('allows shipped → delivered', () => {
    expect(ORDER_STATUS_TRANSITIONS['shipped']).toContain('delivered');
  });

  it('does NOT allow delivered → pending (no backwards)', () => {
    const transitions = ORDER_STATUS_TRANSITIONS['delivered'] ?? [];
    expect(transitions).not.toContain('pending');
  });

  it('does NOT allow cancelled → any forward state', () => {
    const transitions = ORDER_STATUS_TRANSITIONS['cancelled'] ?? [];
    expect(transitions).toHaveLength(0);
  });

  it('covers all valid status keys', () => {
    const validStatuses: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    for (const s of validStatuses) {
      expect(ORDER_STATUS_TRANSITIONS).toHaveProperty(s);
    }
  });
});
