'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStoredToken } from '@/lib/auth';
import styles from './audit.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resourceId: string | null;
  resourceType: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

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

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('all');
  const [limit, setLimit] = useState(100);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const params = new URLSearchParams({ limit: String(limit) });
      if (action !== 'all') params.set('action', action);
      const endpoint = action !== 'all'
        ? `/api/audit/action?${params}`
        : `/api/audit?${params}`;
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } finally {
      setLoading(false);
    }
  }, [action, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.heading}>Audit Log</h1>
          <p className={styles.sub}>Security and activity log for all admin actions</p>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Action</label>
          <select
            className={styles.select}
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            {ACTION_FILTER_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a === 'all' ? 'All Actions' : a}
              </option>
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

      {/* Log table */}
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
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.loading}>Loading…</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>No audit logs found.</td>
              </tr>
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
                      {log.resourceType && (
                        <span className={styles.resourceType}>{log.resourceType}</span>
                      )}
                      {log.resourceId && (
                        <span className={styles.mono}> {log.resourceId.slice(-8)}</span>
                      )}
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
