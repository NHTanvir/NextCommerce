'use client';

import styles from './OrderTimeline.module.scss';

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

const TIMELINE: Array<{ status: OrderStatus; label: string; icon: string }> = [
  { status: 'pending', label: 'Order Placed', icon: '📝' },
  { status: 'paid', label: 'Payment Confirmed', icon: '💳' },
  { status: 'processing', label: 'Processing', icon: '⚙️' },
  { status: 'shipped', label: 'Shipped', icon: '🚚' },
  { status: 'delivered', label: 'Delivered', icon: '✅' },
];

const CANCELLED_STEPS: Array<{ status: OrderStatus; label: string; icon: string }> = [
  { status: 'cancelled', label: 'Cancelled', icon: '❌' },
];

const STATUS_ORDER: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

interface Props {
  currentStatus: OrderStatus;
  timestamps?: Partial<Record<OrderStatus, string>>;
}

export function OrderTimeline({ currentStatus, timestamps = {} }: Props) {
  const isCancelled = currentStatus === 'cancelled' || currentStatus === 'refunded';
  const steps = isCancelled ? CANCELLED_STEPS : TIMELINE;

  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className={styles.timeline}>
      {steps.map((step, i) => {
        const stepIdx = STATUS_ORDER.indexOf(step.status);
        const isDone = isCancelled ? false : stepIdx < currentIdx;
        const isActive = isCancelled ? true : stepIdx === currentIdx;
        const ts = timestamps[step.status];

        return (
          <div key={step.status} className={styles.step}>
            <div className={styles.dotCol}>
              <div className={`${styles.dot} ${isDone ? styles.done : ''} ${isActive ? styles.active : ''} ${isCancelled ? styles.cancelled : ''}`}>
                {isDone ? '✓' : step.icon}
              </div>
              {i < steps.length - 1 && (
                <div className={`${styles.line} ${isDone ? styles.lineDone : ''}`} />
              )}
            </div>
            <div className={styles.info}>
              <span className={`${styles.label} ${isActive ? styles.labelActive : ''} ${isDone ? styles.labelDone : ''}`}>
                {step.label}
              </span>
              {ts && (
                <time className={styles.time}>
                  {new Date(ts).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </time>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
