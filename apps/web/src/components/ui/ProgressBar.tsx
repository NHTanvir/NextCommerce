import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'accent' | 'success' | 'warning';
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  size = 'md',
  color = 'accent',
  animated = false,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={styles.wrapper}>
      {label && (
        <div className={styles.labelRow}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={`${styles.track} ${styles[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`${styles.fill} ${styles[color]} ${animated ? styles.animated : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
