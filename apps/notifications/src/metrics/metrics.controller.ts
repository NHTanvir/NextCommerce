import { Controller, Get, Header } from '@nestjs/common';
import { MetricsCounter } from './metrics.counter';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly counter: MetricsCounter) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4')
  getMetrics(): string {
    const s = this.counter.snapshot();
    return [
      '# HELP nextcommerce_notifications_consumed_total Notifications consumed from RabbitMQ',
      '# TYPE nextcommerce_notifications_consumed_total counter',
      `nextcommerce_notifications_consumed_total ${s.consumed}`,
      '# HELP nextcommerce_notifications_failed_total Notification handler failures',
      '# TYPE nextcommerce_notifications_failed_total counter',
      `nextcommerce_notifications_failed_total ${s.failed}`,
      '# HELP nextcommerce_notifications_uptime_seconds Process uptime',
      '# TYPE nextcommerce_notifications_uptime_seconds gauge',
      `nextcommerce_notifications_uptime_seconds ${s.uptimeSec}`,
      '',
    ].join('\n');
  }
}
