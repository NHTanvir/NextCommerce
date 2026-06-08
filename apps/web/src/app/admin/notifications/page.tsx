'use client';

import { useState } from 'react';
import {
  useGetAdminNotificationStatsQuery,
  useBroadcastNotificationMutation,
  type NotificationType,
} from '@/store/api/notifications.api';
import styles from '../admin.module.scss';

const NOTIFICATION_TYPES: NotificationType[] = [
  'flash_sale', 'system', 'order_placed', 'loyalty_points', 'back_in_stock',
];

export default function AdminNotificationsPage() {
  const { data: stats, isLoading } = useGetAdminNotificationStatsQuery();
  const [broadcast, { isLoading: sending }] = useBroadcastNotificationMutation();

  const [userIds, setUserIds] = useState('');
  const [type, setType] = useState<NotificationType>('system');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [result, setResult] = useState('');

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const ids = userIds.split(',').map((id) => id.trim()).filter(Boolean);
    if (ids.length === 0) { setResult('Enter at least one user ID.'); return; }
    try {
      const res = await broadcast({ userIds: ids, type, title, body, actionUrl: actionUrl || undefined }).unwrap();
      setResult(`Sent to ${res.sent} user(s).`);
      setUserIds(''); setTitle(''); setBody(''); setActionUrl('');
    } catch {
      setResult('Failed to send notification.');
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title} style={{ marginBottom: '1.5rem' }}>Notifications</h1>

      {isLoading ? (
        <div>Loading stats…</div>
      ) : stats && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Sent', value: stats.total, color: '#58a6ff' },
            { label: 'Unread', value: stats.unread, color: '#e94560' },
            { label: 'Read Rate', value: `${stats.readRate}%`, color: '#3fb950' },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, minWidth: 110, background: 'var(--color-surface)',
              border: `1px solid ${s.color}30`, borderRadius: '0.75rem',
              padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {stats && stats.byType.length > 0 && (
        <section style={{ marginBottom: '2rem', background: 'var(--color-surface)', borderRadius: '0.75rem', padding: '1rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>By Type</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {stats.byType.map((t) => (
              <span key={t.type} style={{
                background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                borderRadius: '0.375rem', padding: '0.25rem 0.625rem', fontSize: '0.8rem', fontWeight: 600,
              }}>
                {t.type}: {t.count}
              </span>
            ))}
          </div>
        </section>
      )}

      <section style={{ background: 'var(--color-surface)', borderRadius: '0.75rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Broadcast Notification</h2>
        {result && <p style={{ color: result.startsWith('Sent') ? '#3fb950' : '#e94560', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{result}</p>}
        <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>User IDs (comma-separated)</label>
            <textarea
              rows={2}
              required
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              placeholder="uuid1, uuid2, uuid3"
              style={{ width: '100%', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.375rem', padding: '0.5rem', color: 'inherit', resize: 'vertical', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                style={{ width: '100%', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.375rem', padding: '0.5rem', color: 'inherit', fontSize: '0.85rem' }}
              >
                {NOTIFICATION_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Action URL (optional)</label>
              <input
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="/products/sale"
                style={{ width: '100%', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.375rem', padding: '0.5rem', color: 'inherit', fontSize: '0.85rem' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Flash Sale Live Now!"
              style={{ width: '100%', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.375rem', padding: '0.5rem', color: 'inherit', fontSize: '0.85rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Message</label>
            <textarea
              required
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Up to 50% off on all sneakers this weekend only."
              style={{ width: '100%', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.375rem', padding: '0.5rem', color: 'inherit', resize: 'vertical', fontSize: '0.85rem' }}
            />
          </div>
          <button type="submit" className="btn btn--primary" disabled={sending} style={{ alignSelf: 'flex-start' }}>
            {sending ? 'Sending…' : 'Send Broadcast'}
          </button>
        </form>
      </section>
    </div>
  );
}
