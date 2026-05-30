import styles from './Badge.module.scss';

type Variant = 'accent' | 'success' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'neutral', size = 'md' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]}`}>
      {children}
    </span>
  );
}
