'use client';

import { useState } from 'react';
import { getStoredToken } from '@/lib/auth';
import styles from './loyalty.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface LoyaltyAccount {
  id: string;
  userId: string;
  points: number;
  lifetimePoints: number;
  tier: string;
  updatedAt: string;
}

interface PageData {
  data: LoyaltyAccount[];
  total: number;
}

const TIER_COLORS: Record<string, string> = {
  bronze: '#cd7f32',
  silver: '#8b949e',
  gold: '#ffd700',
  platinum: '#e5e4e2',
};

const TIER_EMOJI: Record<string, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
};

export default function AdminLoyaltyPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [awardModal, setAwardModal] = useState<LoyaltyAccount | null>(null);
  const [awardForm, setAwardForm] = useState({ points: '', description: '' });
  const [awardMsg, setAwardMsg] = useState('');
  const limit = 30;

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const res = await fetch(`${API_URL}/api/loyalty/admin/accounts?page=${p}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setPage(p);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAward = async () => {
    if (!awardModal || !awardForm.points || !awardForm.description) return;
    const token = getStoredToken();
    try {
      const res = await fetch(`${API_URL}/api/loyalty/admin/award`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: awardModal.userId,
          points: Number(awardForm.points),
          description: awardForm.description,
        }),
      });
      if (res.ok) {
        setAwardMsg('Points awarded successfully!');
        setAwardForm({ points: '', description: '' });
        setTimeout(() => {
          setAwardModal(null);
          setAwardMsg('');
          load(page);
        }, 1500);
      } else {
        setAwardMsg('Failed to award points.');
      }
    } catch {
      setAwardMsg('Error occurred.');
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;
  const tiers = data ? {
    platinum: data.data.filter((a) => a.tier === 'platinum').length,
    gold: data.data.filter((a) => a.tier === 'gold').length,
    silver: data.data.filter((a) => a.tier === 'silver').length,
    bronze: data.data.filter((a) => a.tier === 'bronze').length,
  } : null;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.heading}>Loyalty Program</h1>
          {data && <p className={styles.sub}>{data.total} enrolled members</p>}
        </div>
        {!data ? (
          <button className="btn btn--primary" onClick={() => load(1)} disabled={loading}>
            {loading ? 'Loading…' : 'Load Accounts'}
          </button>
        ) : null}
      </div>

      {tiers && (
        <div className={styles.tierGrid}>
          {(['platinum', 'gold', 'silver', 'bronze'] as const).map((tier) => (
            <div key={tier} className={styles.tierCard}>
              <span className={styles.tierEmoji}>{TIER_EMOJI[tier]}</span>
              <span className={styles.tierCount}>{tiers[tier]}</span>
              <span className={styles.tierLabel} style={{ color: TIER_COLORS[tier] }}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}

      {data && (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User ID</th>
                  <th>Tier</th>
                  <th>Current Points</th>
                  <th>Lifetime Points</th>
                  <th>Last Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((acc, i) => (
                  <tr key={acc.id}>
                    <td className={styles.rank}>{(page - 1) * limit + i + 1}</td>
                    <td className={styles.mono}>{acc.userId.slice(-12)}</td>
                    <td>
                      <span
                        className={styles.tierBadge}
                        style={{ color: TIER_COLORS[acc.tier], borderColor: TIER_COLORS[acc.tier] + '40' }}
                      >
                        {TIER_EMOJI[acc.tier]} {acc.tier}
                      </span>
                    </td>
                    <td className={styles.points}>{acc.points.toLocaleString()}</td>
                    <td className={styles.lifetime}>{acc.lifetimePoints.toLocaleString()}</td>
                    <td className={styles.date}>
                      {new Date(acc.updatedAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td>
                      <button
                        className={styles.awardBtn}
                        onClick={() => setAwardModal(acc)}
                      >
                        Award Points
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page <= 1 || loading}
                onClick={() => load(page - 1)}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages || loading}
                onClick={() => load(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Award Modal */}
      {awardModal && (
        <div className={styles.overlay} onClick={() => setAwardModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Award Points</h3>
            <p className={styles.modalSub}>
              User: <span className={styles.mono}>{awardModal.userId.slice(-12)}</span>
              {' '}· Current: {awardModal.points.toLocaleString()} pts
            </p>
            {awardMsg ? (
              <div className={styles.msgBox}>{awardMsg}</div>
            ) : (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>Points to Award</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="1"
                    value={awardForm.points}
                    onChange={(e) => setAwardForm((f) => ({ ...f, points: e.target.value }))}
                    placeholder="100"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Description</label>
                  <input
                    className={styles.input}
                    value={awardForm.description}
                    onChange={(e) => setAwardForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Bonus for loyalty milestone"
                  />
                </div>
                <div className={styles.modalActions}>
                  <button className="btn btn--ghost" onClick={() => setAwardModal(null)}>Cancel</button>
                  <button
                    className="btn btn--primary"
                    onClick={handleAward}
                    disabled={!awardForm.points || !awardForm.description}
                  >
                    Award Points
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
