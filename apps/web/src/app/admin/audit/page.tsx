'use client';

import { useState } from 'react';
import { useGetAuditLogsQuery, useGetAuditStatsQuery } from '@/store/api/audit.api';
import styles from './audit.module.scss';

const ACTION_COLORS: Record<string, string> = {
  'user.login': '#58a6ff',
  'user.register': '#3fb950',
  'user.logout': '#8b949e',
  'order.create': '#e94560',
  'order.status_change': '#f59e0b',
  'product.create': '#3fb950',
  'product.update': '#58a6ff',
  'product.delete': '#e94560',
  'coupon.create': '#8957e5',
  'coupon.redeem': '#f59e0b',
  'inventory.adjust': '#ffa657',
};

const ACTION_FILTER_OPTIONS = [
  'all',
  'user.login',
  'user.register',
  'order.create',
  'order.status_change',
  'product.create',
  'product.update',
  'coupon.redeem',
  'inventory.adjust',
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AdminAuditPage() {
  const [action, setAction] = useState('all');
  const [limit, setLimit] = useState(100);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: logs = [], isLoading, refetch } = useGetAuditLogsQuery({ limit, action });
  const { data: auditStats } = useGetAuditStatsQuery();

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.heading}>Audit Log</h1>
          <p className={styles.sub}>Security and activity log for all admin actions</p>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={refetch} disabled={isLoading}>
          {isLoading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      {auditStats && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Events', value: auditStats.total.toLocaleString(), color: '#58a6ff' },
            { label: 'Last 24h', value: auditStats.last24h.toLocaleString(), color: '#3fb950' },
          ].map((s) => (
            <div key={s.label} style={{
              flex: '0 1 auto', minWidth: 120, background: 'var(--color-surface)',
              border: `1px solid ${s.color}30`, borderRadius: '0.75rem',
              padding: '0.875rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Action</label>
          <select
            className={styles.select}
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            {ACTION_FILTER_OPTIONS.map((a) => (
              <option key={a} value={a}>{a === 'all' ? 'All Actions' : a}</option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Limit</label>
          <select
            className={styles.select}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {[50, 100, 200, 500].map((n) => (
              <option key={n} value={n}>{n} entries</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>User ID</th>
              <th>Resource</th>
              <th>IP</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && logs.length === 0 ? (
              <tr><td colSpan={6} className={styles.loading}>Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className={styles.empty}>No audit logs found.</td></tr>
            ) : (
              logs.map((log) => (
                <>
                  <tr key={log.id} className={styles.row}>
                    <td className={styles.time} title={new Date(log.createdAt).toISOString()}>
                      {timeAgo(log.createdAt)}
                    </td>
                    <td>
                      <span
                        className={styles.actionBadge}
                        style={{
                          color: ACTION_COLORS[log.action] ?? '#8b949e',
                          borderColor: (ACTION_COLORS[log.action] ?? '#8b949e') + '40',
                          background: (ACTION_COLORS[log.action] ?? '#8b949e') + '15',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className={styles.mono}>{log.userId ? log.userId.slice(-8) : '—'}</td>
                    <td className={styles.resource}>
                      {log.resourceType && <span className={styles.resourceType}>{log.resourceType}</span>}
                      {log.resourceId && <span className={styles.mono}> {log.resourceId.slice(-8)}</span>}
                      {!log.resourceType && !log.resourceId && '—'}
                    </td>
                    <td className={styles.ip}>{log.ipAddress ?? '—'}</td>
                    <td>
                      {log.metadata && (
                        <button
                          className={styles.expandBtn}
                          onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                        >
                          {expanded === log.id ? '▲ Hide' : '▼ Show'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded === log.id && log.metadata && (
                    <tr key={`${log.id}-detail`}>
                      <td colSpan={6} className={styles.metaRow}>
                        <pre className={styles.metaJson}>
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className={styles.hint}>
        Showing {logs.length} of up to {limit} entries. Use filters to narrow results.
      </p>
    </div>
  );
}
