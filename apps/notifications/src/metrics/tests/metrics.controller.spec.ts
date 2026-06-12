import { MetricsController } from '../metrics.controller';
import { MetricsCounter } from '../metrics.counter';

describe('MetricsController', () => {
  let controller: MetricsController;
  let counter: MetricsCounter;

  beforeEach(() => {
    counter = new MetricsCounter();
    controller = new MetricsController(counter);
  });

  it('returns Prometheus exposition format with all three series', () => {
    counter.incConsumed();
    counter.incFailed();

    const out = controller.getMetrics();

    expect(out).toContain('nextcommerce_notifications_consumed_total 1');
    expect(out).toContain('nextcommerce_notifications_failed_total 1');
    expect(out).toMatch(/nextcommerce_notifications_uptime_seconds \d+/);
  });

  it('includes HELP and TYPE annotations for each metric', () => {
    const out = controller.getMetrics();
    expect(out).toMatch(/# HELP nextcommerce_notifications_consumed_total/);
    expect(out).toMatch(/# TYPE nextcommerce_notifications_consumed_total counter/);
    expect(out).toMatch(/# HELP nextcommerce_notifications_failed_total/);
    expect(out).toMatch(/# TYPE nextcommerce_notifications_uptime_seconds gauge/);
  });

  it('ends with a trailing newline (Prometheus convention)', () => {
    expect(controller.getMetrics().endsWith('\n')).toBe(true);
  });
});
