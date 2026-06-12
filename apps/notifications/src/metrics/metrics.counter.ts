import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsCounter {
  private consumed = 0;
  private failed = 0;
  private readonly startedAt = Date.now();

  incConsumed(): void {
    this.consumed++;
  }

  incFailed(): void {
    this.failed++;
  }

  snapshot(): { consumed: number; failed: number; uptimeSec: number } {
    return {
      consumed: this.consumed,
      failed: this.failed,
      uptimeSec: Math.floor((Date.now() - this.startedAt) / 1000),
    };
  }
}
