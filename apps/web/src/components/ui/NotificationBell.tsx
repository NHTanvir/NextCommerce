'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  type NotificationType,
} from '@/store/api/notifications.api';
import styles from './NotificationBell.module.scss';

const TYPE_ICONS: Record<NotificationType, string> = {
  order_placed: '📦',
  order_shipped: '🚚',
  order_delivered: '✅',
  order_cancelled: '❌',
  return_approved: '↩️',
  return_rejected: '🚫',
  review_approved: '⭐',
  loyalty_points: '🏅',
  loyalty_tier_up: '🏆',
  gift_card_received: '🎁',
  price_drop: '📉',
  back_in_stock: '🔔',
  flash_sale: '⚡',
  system: '🔧',
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function NotificationBell() {
  const user = useAppSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useGetNotificationsQuery(
    { limit: 20 },
    { skip: !user, pollingInterval: 60_000 },
  );

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const handleClick = (notification: { id: string; isRead: boolean; actionUrl: string | null }) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setOpen(false);
  };

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        className={styles.bell}
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button
                className={styles.markAllBtn}
                onClick={() => markAllAsRead()}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className={styles.list}>
            {isLoading ? (
              <div className={styles.empty}>Loading…</div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🔔</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const inner = (
                  <div
                    className={`${styles.item} ${!n.isRead ? styles.unread : ''}`}
                    onClick={() => handleClick(n)}
                  >
                    <span className={styles.typeIcon}>
                      {TYPE_ICONS[n.type] ?? '🔔'}
                    </span>
                    <div className={styles.content}>
                      <p className={styles.notifTitle}>{n.title}</p>
                      <p className={styles.notifBody}>{n.body}</p>
                      <span className={styles.time}>{timeAgo(n.createdAt)}</span>
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteNotification(n.id); }}
                      aria-label="Delete notification"
                    >
                      ×
                    </button>
                  </div>
                );

                return n.actionUrl ? (
                  <Link key={n.id} href={n.actionUrl} className={styles.itemLink}>
                    {inner}
                  </Link>
                ) : (
                  <div key={n.id} className={styles.itemLink}>
                    {inner}
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className={styles.dropdownFooter}>
              <Link href="/account/notifications" onClick={() => setOpen(false)}>
                View all
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
