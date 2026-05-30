export function formatCents(cents: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function parseDollars(dollars: string): number {
  const cleaned = dollars.replace(/[^0-9.]/g, '');
  return Math.round(parseFloat(cleaned) * 100);
}

export function applyDiscount(priceCents: number, discountPercent: number): number {
  return Math.round(priceCents * (1 - discountPercent / 100));
}
