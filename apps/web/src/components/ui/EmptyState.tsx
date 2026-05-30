import Link from 'next/link';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <span className={styles.icon}>{icon}</span>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <Link href={action.href} className="btn btn--primary">
          {action.label}
        </Link>
      )}
    </div>
  );
}
