/**
 * Convert an order UUID into a short, customer-facing order number.
 * Takes the first 8 hex chars of the UUID, uppercased — collision-free
 * enough for human reference while preserving the canonical UUID elsewhere.
 */
export function toOrderNumber(orderId: string): string {
  return orderId.replace(/-/g, '').slice(0, 8).toUpperCase();
}
