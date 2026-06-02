import styles from './Avatar.module.scss';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away';
}

const SIZE_CLASSES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function getColor(name: string): string {
  const colors = ['#e94560', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function Avatar({ name = 'User', src, size = 'md', status }: AvatarProps) {
  const px = SIZE_CLASSES[size];

  return (
    <div
      className={`${styles.wrapper} ${styles[size]}`}
      style={{ width: px, height: px }}
      aria-label={name}
    >
      {src ? (
        <img src={src} alt={name} className={styles.image} />
      ) : (
        <div
          className={styles.initials}
          style={{ background: getColor(name) }}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span className={`${styles.status} ${styles[status]}`} aria-hidden="true" />
      )}
    </div>
  );
}
