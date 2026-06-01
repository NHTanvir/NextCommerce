import { MetricsService } from './metrics.service';
import { Registry } from 'prom-client';

describe('MetricsService', () => {
  let service: MetricsService;
  let registry: Registry;

  beforeEach(() => {
    registry = new Registry();
    service = new MetricsService();
  });

  it('initializes without throwing', () => {
    expect(service).toBeDefined();
  });

  it('exposes getMetrics method', () => {
    expect(typeof service.getMetrics).toBe('function');
  });

  it('exposes recordHttpRequest method', () => {
    expect(typeof service.recordHttpRequest).toBe('function');
  });

  it('exposes recordCheckoutDuration method', () => {
    expect(typeof service.recordCheckoutDuration).toBe('function');
  });

  it('recordHttpRequest does not throw', () => {
    expect(() =>
      service.recordHttpRequest('GET', '/api/products', '200', 0.05)
    ).not.toThrow();
  });

  it('recordCheckoutDuration does not throw', () => {
    expect(() => service.recordCheckoutDuration(0.12)).not.toThrow();
  });
});
