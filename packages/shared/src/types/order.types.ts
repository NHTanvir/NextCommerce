export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'fulfilled'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['fulfilled', 'refunded'],
  fulfilled: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
  refunded: [],
};

export interface OrderItemDto {
  id: string;
  variantId: string;
  quantity: number;
  unitPriceCents: number;
  productTitle: string;
  size: number;
  color: string;
}

export interface OrderDto {
  id: string;
  status: OrderStatus;
  totalCents: number;
  items: OrderItemDto[];
  placedAt: string;
}
