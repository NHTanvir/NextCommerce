import { MetricsService } from '../metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
  });

  it('getMetrics() returns a non-empty prometheus text string', async () => {
    const result = await service.getMetrics();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('observeHttpRequest() does not throw', () => {
    expect(() => service.observeHttpRequest('GET', '/api/products', 200, 0.05)).not.toThrow();
  });

  it('observeCheckout() does not throw', () => {
    expect(() => service.observeCheckout(0.12)).not.toThrow();
  });

  it('setCacheHitRatio() does not throw', () => {
    expect(() => service.setCacheHitRatio(0.87)).not.toThrow();
  });

  it('getMetrics() output includes HTTP histogram name after observation', async () => {
    service.observeHttpRequest('POST', '/api/orders', 201, 0.08);
    const metrics = await service.getMetrics();
    expect(metrics).toContain('nextcommerce_http_request_duration_seconds');
  });

  it('getMetrics() output includes checkout histogram name', async () => {
    service.observeCheckout(0.3);
    const metrics = await service.getMetrics();
    expect(metrics).toContain('nextcommerce_checkout_latency_seconds');
  });

  it('getMetrics() output includes cache hit gauge name', async () => {
    service.setCacheHitRatio(0.9);
    const metrics = await service.getMetrics();
    expect(metrics).toContain('nextcommerce_cache_hit_ratio');
  });
});
