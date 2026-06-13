import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
  });

  it('initializes without throwing', () => {
    expect(service).toBeDefined();
  });

  it('exposes getMetrics method', () => {
    expect(typeof service.getMetrics).toBe('function');
  });

  it('exposes observeHttpRequest method', () => {
    expect(typeof service.observeHttpRequest).toBe('function');
  });

  it('exposes observeCheckout method', () => {
    expect(typeof service.observeCheckout).toBe('function');
  });

  it('observeHttpRequest does not throw', () => {
    expect(() => service.observeHttpRequest('GET', '/api/products', 200, 0.05)).not.toThrow();
  });

  it('observeCheckout does not throw', () => {
    expect(() => service.observeCheckout(0.12)).not.toThrow();
  });
});
