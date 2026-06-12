import { MetricsCounter } from '../metrics.counter';

describe('MetricsCounter', () => {
  let counter: MetricsCounter;

  beforeEach(() => {
    counter = new MetricsCounter();
  });

  it('starts at zero', () => {
    const s = counter.snapshot();
    expect(s.consumed).toBe(0);
    expect(s.failed).toBe(0);
    expect(s.uptimeSec).toBeGreaterThanOrEqual(0);
  });

  it('incConsumed bumps the consumed counter monotonically', () => {
    counter.incConsumed();
    counter.incConsumed();
    counter.incConsumed();
    expect(counter.snapshot().consumed).toBe(3);
  });

  it('incFailed and incConsumed are independent', () => {
    counter.incConsumed();
    counter.incFailed();
    counter.incFailed();
    const s = counter.snapshot();
    expect(s.consumed).toBe(1);
    expect(s.failed).toBe(2);
  });
});
