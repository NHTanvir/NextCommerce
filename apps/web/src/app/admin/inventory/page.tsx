'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/auth.slice';
import { getStoredToken } from '@/lib/auth';
import styles from './inventory.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface LowStockVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  stockQty: number;
  product?: { title: string; slug: string };
}

export default function AdminInventoryPage() {
  const [alerts, setAlerts] = useState<LowStockVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [deltaInputs, setDeltaInputs] = useState<Record<string, string>>({});

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const token = getStoredToken();
      const res = await fetch(`${API_URL}/api/inventory/alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.data ?? data);
      }
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  const handleAdjust = async (variantId: string) => {
    const delta = parseInt(deltaInputs[variantId] ?? '0', 10);
    if (isNaN(delta) || delta === 0) return;
    try {
      setAdjusting(variantId);
      const token = getStoredToken();
      await fetch(`${API_URL}/api/inventory/variants/${variantId}/adjust`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ delta }),
      });
      setDeltaInputs((prev) => ({ ...prev, [variantId]: '' }));
      loadAlerts();
    } finally {
      setAdjusting(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inventory</h1>
        <button className="btn btn-secondary" onClick={loadAlerts} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Low-Stock Alerts'}
        </button>
      </div>

      {!loaded ? (
        <div className={styles.placeholder}>
          <p>Click "Refresh Low-Stock Alerts" to load variants with 5 or fewer units.</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className={styles.allGood}>
          <span>✅</span>
          <p>All variants are adequately stocked.</p>
        </div>
      ) : (
        <>
          <p className={styles.alertCount}>{alerts.length} variants need restocking</p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Stock</th>
                  <th>Adjust</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((v) => (
                  <tr key={v.id}>
                    <td className={styles.productTitle}>{v.product?.title ?? '—'}</td>
                    <td className={styles.sku}>{v.sku}</td>
                    <td>{v.size}</td>
                    <td>{v.color}</td>
                    <td>
                      <span className={styles.stockBadge}>{v.stockQty}</span>
                    </td>
                    <td>
                      <div className={styles.adjustRow}>
                        <input
                          type="number"
                          className={styles.deltaInput}
                          value={deltaInputs[v.id] ?? ''}
                          onChange={(e) =>
                            setDeltaInputs((p) => ({ ...p, [v.id]: e.target.value }))
                          }
                          placeholder="+10"
                        />
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleAdjust(v.id)}
                          disabled={adjusting === v.id}
                        >
                          {adjusting === v.id ? '...' : 'Apply'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
