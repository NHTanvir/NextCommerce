import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry = new client.Registry();
  readonly httpRequestDuration: client.Histogram;
  readonly checkoutDuration: client.Histogram;
  readonly cacheHitRate: client.Gauge;

  constructor() {
    client.collectDefaultMetrics({ register: this.registry, prefix: 'nextcommerce_' });

    this.httpRequestDuration = new client.Histogram({
      name: 'nextcommerce_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
      registers: [this.registry],
    });

    this.checkoutDuration = new client.Histogram({
      name: 'nextcommerce_checkout_latency_seconds',
      help: 'SLI: checkout request latency — SLO: p95 < 500ms',
      buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.cacheHitRate = new client.Gauge({
      name: 'nextcommerce_cache_hit_ratio',
      help: 'Redis cache hit ratio (0–1). Target: > 0.8',
      registers: [this.registry],
    });
  }

  onModuleInit() {}

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  observeHttpRequest(method: string, route: string, statusCode: number, durationSec: number) {
    this.httpRequestDuration.observe({ method, route, status_code: statusCode }, durationSec);
  }

  observeCheckout(durationSec: number) {
    this.checkoutDuration.observe(durationSec);
  }

  setCacheHitRatio(ratio: number) {
    this.cacheHitRate.set(ratio);
  }
}
