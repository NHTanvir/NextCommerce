import { ORDER_STATUS_TRANSITIONS } from '../types/order.types';
import type { OrderStatus } from '../types/order.types';

describe('ORDER_STATUS_TRANSITIONS', () => {
  it('allows pending → paid', () => {
    expect(ORDER_STATUS_TRANSITIONS['pending']).toContain('paid');
  });

  it('allows pending → cancelled', () => {
    expect(ORDER_STATUS_TRANSITIONS['pending']).toContain('cancelled');
  });

  // 'fulfilled' is the state this machine actually has, and what the Order
  // entity, the API DTOs, the service guard and the admin UI all use. The
  // suite was written against an earlier draft that called it 'processing'.
  it('allows paid → fulfilled', () => {
    expect(ORDER_STATUS_TRANSITIONS['paid']).toContain('fulfilled');
  });

  it('allows fulfilled → shipped', () => {
    expect(ORDER_STATUS_TRANSITIONS['fulfilled']).toContain('shipped');
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
    const validStatuses: OrderStatus[] = [
      'pending',
      'paid',
      'fulfilled',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ];
    for (const s of validStatuses) {
      expect(ORDER_STATUS_TRANSITIONS).toHaveProperty(s);
    }
  });
});
