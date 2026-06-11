import { NotificationsBus, NotificationEvent } from '../notifications.bus';

function event(userId: string): NotificationEvent {
  return {
    userId,
    notification: {
      id: `n-${userId}`,
      type: 'order_placed',
      title: 'Order Confirmed',
      body: 'Hello',
      actionUrl: '/account/orders/o-1',
      createdAt: new Date(),
    },
  };
}

describe('NotificationsBus', () => {
  let bus: NotificationsBus;

  beforeEach(() => {
    bus = new NotificationsBus();
  });

  it('delivers events to subscribers', () => {
    const received: NotificationEvent[] = [];
    bus.on((e) => received.push(e));
    bus.emit(event('u-1'));
    expect(received).toHaveLength(1);
    expect(received[0].userId).toBe('u-1');
  });

  it('supports multiple concurrent subscribers', () => {
    const a: NotificationEvent[] = [];
    const b: NotificationEvent[] = [];
    bus.on((e) => a.push(e));
    bus.on((e) => b.push(e));
    bus.emit(event('u-1'));
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
  });
});
