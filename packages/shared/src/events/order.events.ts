export const ORDER_EVENTS = {
  PLACED: 'order.placed',
  PAID: 'order.paid',
  SHIPPED: 'order.shipped',
  DELIVERED: 'order.delivered',
  CANCELLED: 'order.cancelled',
} as const;

export type OrderEventType = (typeof ORDER_EVENTS)[keyof typeof ORDER_EVENTS];

export interface OrderPlacedEvent {
  orderId: string;
  userId: string;
  totalCents: number;
  placedAt: string;
}

export interface OrderPaidEvent {
  orderId: string;
  userId: string;
  paidAt: string;
}

export interface OrderShippedEvent {
  orderId: string;
  userId: string;
  shippedAt: string;
}
