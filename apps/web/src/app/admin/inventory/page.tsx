'use client';

import { useState } from 'react';
import {
  useGetLowStockAlertsQuery,
  useAdjustStockMutation,
  useGetStockSummaryQuery,
} from '@/store/api/inventory.api';
import styles from '../admin.module.scss';

export default function AdminInventoryPage() {
  const [threshold, setThreshold] = useState(10);
  const [deltas, setDeltas] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const { data: alerts = [], isLoading, refetch } = useGetLowStockAlertsQuery(threshold);
  const { data: stockSummary } = useGetStockSummaryQuery();
  const [adjustStock] = useAdjustStockMutation();

  const handleAdjust = async (variantId: string) => {
    const delta = parseInt(deltas[variantId] ?? '0', 10);
    if (isNaN(delta) || delta === 0) return;
    setSaving(variantId);
    try {
      await adjustStock({ variantId, delta }).unwrap();
      setDeltas((prev) => ({ ...prev, [variantId]: '' }));
      refetch();
    } catch {
      // silent
    } finally {
      setSaving(null);
    }
  };

  const outOfStock = alerts.filter((a) => a.stockQty === 0).length;
  const critical = alerts.filter((a) => a.stockQty > 0 && a.stockQty <= 3).length;

  return (
    <div className={styles.page}>
      {stockSummary && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Variants', value: stockSummary.totalVariants, color: '#58a6ff' },
            { label: 'Total Stock', value: stockSummary.totalStock.toLocaleString(), color: '#3fb950' },
            { label: 'In Stock', value: stockSummary.inStock, color: '#3fb950' },
            { label: 'Low Stock', value: stockSummary.lowStock, color: '#f59e0b' },
            { label: 'Out of Stock', value: stockSummary.outOfStock, color: '#e94560' },
          ].map((s) => (
            <div key={s.label} className={styles.metricCard} style={{ flex: '1', minWidth: '140px' }}>
              <span className={styles.metricValue} style={{ color: s.color }}>{s.value}</span>
              <span className={styles.metricLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      )}
      <div className={styles.dashHeader}>
        <h1 className={styles.pageTitle}>Inventory Management</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Low stock threshold:
          </label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            min={1}
            max={100}
            style={{
              width: 70,
              padding: '0.375rem 0.5rem',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
            }}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ color: '#e94560', background: '#e9456018' }}>🚨</div>
          <div className={styles.statBody}>
            <span className={styles.statValue} style={{ color: '#e94560' }}>{outOfStock}</span>
            <span className={styles.statLabel}>Out of Stock</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ color: '#f59e0b', background: '#f59e0b18' }}>⚠️</div>
          <div className={styles.statBody}>
            <span className={styles.statValue} style={{ color: '#f59e0b' }}>{critical}</span>
            <span className={styles.statLabel}>Critical (≤3)</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ color: '#3b82f6', background: '#3b82f618' }}>📋</div>
          <div className={styles.statBody}>
            <span className={styles.statValue} style={{ color: '#3b82f6' }}>{alerts.length}</span>
            <span className={styles.statLabel}>Low Stock SKUs</span>
          </div>
        </div>
      </div>

      {/* Low stock table */}
      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Low Stock Alerts</h2>
          <button className="btn btn--ghost btn--sm" onClick={() => refetch()}>↺ Refresh</button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Size</th>
              <th>Color</th>
              <th>Stock Qty</th>
              <th>Status</th>
              <th>Adjust</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={7} className={styles.emptyCell}>Loading…</td></tr>
            )}
            {!isLoading && alerts.map((variant) => {
              const isOos = variant.stockQty === 0;
              const isCritical = !isOos && variant.stockQty <= 3;
              const statusColor = isOos ? '#e94560' : isCritical ? '#f59e0b' : '#d29922';
              const statusLabel = isOos ? 'Out of Stock' : isCritical ? 'Critical' : 'Low Stock';

              return (
                <tr key={variant.variantId}>
                  <td>
                    <code style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--color-accent)' }}>
                      {variant.sku}
                    </code>
                  </td>
                  <td>{variant.size}</td>
                  <td>{variant.color || '—'}</td>
                  <td style={{ fontWeight: 700 }}>{variant.stockQty}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.625rem',
                        borderRadius: 100,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: statusColor,
                        background: statusColor + '20',
                      }}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={() => setDeltas((d) => ({ ...d, [variant.variantId]: String(Number(d[variant.variantId] || 0) - 1) }))}
                        style={{ padding: '0.25rem 0.5rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 4, cursor: 'pointer', color: 'var(--color-text)' }}
                      >−</button>
                      <input
                        type="number"
                        value={deltas[variant.variantId] ?? ''}
                        onChange={(e) => setDeltas((d) => ({ ...d, [variant.variantId]: e.target.value }))}
                        placeholder="0"
                        style={{
                          width: 60,
                          padding: '0.25rem 0.375rem',
                          background: 'var(--color-bg-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 4,
                          color: 'var(--color-text)',
                          fontSize: '0.875rem',
                          textAlign: 'center',
                        }}
                      />
                      <button
                        onClick={() => setDeltas((d) => ({ ...d, [variant.variantId]: String(Number(d[variant.variantId] || 0) + 1) }))}
                        style={{ padding: '0.25rem 0.5rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 4, cursor: 'pointer', color: 'var(--color-text)' }}
                      >+</button>
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => handleAdjust(variant.variantId)}
                      disabled={saving === variant.variantId || !deltas[variant.variantId]}
                    >
                      {saving === variant.variantId ? '…' : 'Apply'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!isLoading && alerts.length === 0 && (
              <tr><td colSpan={7} className={styles.emptyCell}>No low stock alerts — all variants are well stocked.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
