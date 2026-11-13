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

export interface OrderAddressDto {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string;
  country: string;
}

/**
 * What GET /api/orders actually returns. The address is eager-loaded on the
 * Order entity and the API sends the whole row, so the contract says so —
 * the five-field version left every consumer reaching for properties
 * TypeScript insisted were not there.
 */
export interface OrderDto {
  id: string;
  userId: string;
  status: OrderStatus;
  totalCents: number;
  items: OrderItemDto[];
  address?: OrderAddressDto | null;
  addressId?: string;
  paymentRef?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  /** The entity's CreateDateColumn. There is no createdAt on an order. */
  placedAt: string;
  updatedAt?: string;
}
