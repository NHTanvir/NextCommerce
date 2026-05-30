import { ORDER_STATUS_TRANSITIONS } from '@nextcommerce/shared';
import type { OrderStatus } from '@nextcommerce/shared';

describe('Order state machine integration', () => {
  function canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return (ORDER_STATUS_TRANSITIONS[from] ?? []).includes(to);
  }

  it('follows happy path: pending→paid→processing→shipped→delivered', () => {
    expect(canTransition('pending', 'paid')).toBe(true);
    expect(canTransition('paid', 'processing')).toBe(true);
    expect(canTransition('processing', 'shipped')).toBe(true);
    expect(canTransition('shipped', 'delivered')).toBe(true);
  });

  it('allows cancellation from pending', () => {
    expect(canTransition('pending', 'cancelled')).toBe(true);
  });

  it('blocks skipping states (pending → shipped)', () => {
    expect(canTransition('pending', 'shipped')).toBe(false);
  });

  it('blocks backwards transitions (shipped → pending)', () => {
    expect(canTransition('shipped', 'pending')).toBe(false);
  });

  it('blocks any transition from terminal states', () => {
    const terminals: OrderStatus[] = ['delivered', 'cancelled', 'refunded'];
    const allStatuses: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    for (const terminal of terminals) {
      for (const target of allStatuses) {
        expect(canTransition(terminal, target)).toBe(false);
      }
    }
  });
});
