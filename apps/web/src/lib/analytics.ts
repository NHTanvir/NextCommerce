export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

let initialized = false;

export function initAnalytics() {
  if (typeof window === 'undefined') return;
  initialized = true;
}

export function trackEvent(event: AnalyticsEvent) {
  if (!initialized) return;
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Analytics]', event.name, event.properties);
  }
}

export function trackPageView(path: string) {
  trackEvent({ name: 'page_view', properties: { path } });
}

export function trackAddToCart(productId: string, variantId: string, quantity: number, priceCents: number) {
  trackEvent({
    name: 'add_to_cart',
    properties: { productId, variantId, quantity, value: priceCents / 100 },
  });
}

export function trackPurchase(orderId: string, totalCents: number) {
  trackEvent({
    name: 'purchase',
    properties: { orderId, value: totalCents / 100, currency: 'USD' },
  });
}

export function trackSearch(query: string, resultCount: number) {
  trackEvent({ name: 'search', properties: { query, result_count: resultCount } });
}
