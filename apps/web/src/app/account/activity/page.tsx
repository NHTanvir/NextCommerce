'use client';

import Link from 'next/link';
import { useGetMyActivityQuery, type AuditLog } from '@/store/api/audit.api';
import styles from './activity.module.scss';

const ACTION_META: Record<string, { icon: string; label: string; color: string }> = {
  'user.login': { icon: '🔐', label: 'Signed in', color: '#58a6ff' },
  'user.register': { icon: '🎉', label: 'Account created', color: '#3fb950' },
  'user.logout': { icon: '👋', label: 'Signed out', color: '#8b949e' },
  'order.create': { icon: '📦', label: 'Order placed', color: '#8957e5' },
  'order.status_change': { icon: '🔄', label: 'Order updated', color: '#f59e0b' },
  'coupon.redeem': { icon: '🎟️', label: 'Coupon redeemed', color: '#e94560' },
};

function getActionMeta(action: string) {
  return ACTION_META[action] ?? { icon: '📋', label: action.replace('.', ' '), color: '#8b949e' };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function groupByDate(logs: AuditLog[]): [string, AuditLog[]][] {
  const groups: Record<string, AuditLog[]> = {};
  for (const log of logs) {
    const key = new Date(log.createdAt).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
  }
  return Object.entries(groups);
}

export default function AccountActivityPage() {
  const { data: logs = [], isLoading, isError } = useGetMyActivityQuery(50);
  const grouped = groupByDate(logs);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <Link href="/account" className={styles.backLink}>← My Account</Link>
        <h1 className={styles.title}>Account Activity</h1>
        <p className={styles.sub}>Your recent account actions and events</p>
      </div>

      {isLoading && (
        <div className={styles.loading}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🔒</span>
          <p>Sign in to view your account activity.</p>
          <Link href="/auth/login" className="btn btn-primary">Sign In</Link>
        </div>
      )}

      {!isLoading && !isError && logs.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📋</span>
          <p>No activity recorded yet. Start shopping to see your history here.</p>
          <Link href="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      )}

      {!isLoading && !isError && logs.length > 0 && (
        <div className={styles.feed}>
          {grouped.map(([date, entries]) => (
            <div key={date} className={styles.group}>
              <p className={styles.dateLabel}>{date}</p>
              <div className={styles.entries}>
                {entries.map((log) => {
                  const meta = getActionMeta(log.action);
                  return (
                    <div key={log.id} className={styles.entry}>
                      <div
                        className={styles.entryIcon}
                        style={{ background: `${meta.color}18`, color: meta.color }}
                      >
                        {meta.icon}
                      </div>
                      <div className={styles.entryBody}>
                        <p className={styles.entryLabel}>{meta.label}</p>
                        {log.resourceId && (
                          <p className={styles.entryMeta}>
                            {log.resourceType && <span className={styles.resourceType}>{log.resourceType}</span>}
                            <span className={styles.resourceId}>{log.resourceId.slice(-12).toUpperCase()}</span>
                          </p>
                        )}
                        {log.ipAddress && (
                          <p className={styles.entryIp}>from {log.ipAddress}</p>
                        )}
                      </div>
                      <span className={styles.entryTime}>{timeAgo(log.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
