'use client';

import { useState } from 'react';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
  type NotificationType,
} from '@/store/api/notifications.api';
import styles from './notifications.module.scss';

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

type FilterTab = 'all' | 'unread';

export default function AccountNotificationsPage() {
  const [filter, setFilter] = useState<FilterTab>('all');

  const { data, isLoading } = useGetNotificationsQuery({ limit: 100 });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [deleteAll] = useDeleteAllNotificationsMutation();

  const allNotifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const filtered = filter === 'unread'
    ? allNotifications.filter((n) => !n.isRead)
    : allNotifications;

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification?')) return;
    await deleteNotification(id);
  };

  const handleDeleteAll = async () => {
    if (!confirm('Delete all notifications? This cannot be undone.')) return;
    await deleteAll();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Notifications</h1>
          {unreadCount > 0 && (
            <p className={styles.sub}>{unreadCount} unread</p>
          )}
        </div>
        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={() => markAllAsRead()}>
              Mark all as read
            </button>
          )}
          {allNotifications.length > 0 && (
            <button className={styles.deleteAllBtn} onClick={handleDeleteAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        {(['all', 'unread'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${filter === tab ? styles.activeTab : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab === 'all' ? `All (${allNotifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading notifications…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🔔</span>
          <p>{filter === 'unread' ? 'No unread notifications.' : "You're all caught up!"}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.isRead ? styles.unread : ''}`}
            >
              <span className={styles.icon}>{TYPE_ICONS[n.type] ?? '🔔'}</span>

              <div className={styles.content}>
                <p className={styles.title}>{n.title}</p>
                <p className={styles.body}>{n.body}</p>
                <span className={styles.time}>
                  {new Date(n.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className={styles.actions}>
                {!n.isRead && (
                  <button
                    className={styles.readBtn}
                    onClick={() => markAsRead(n.id)}
                  >
                    Mark read
                  </button>
                )}
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(n.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
