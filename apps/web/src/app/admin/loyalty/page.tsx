'use client';

import { useState } from 'react';
import {
  useGetAdminLoyaltyAccountsQuery,
  useGetLoyaltyTierBreakdownQuery,
  useAwardLoyaltyBonusMutation,
  useGetLoyaltyAdminStatsQuery,
  type LoyaltyAccount,
} from '@/store/api/loyalty.api';
import styles from './loyalty.module.scss';

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

const LIMIT = 30;

export default function AdminLoyaltyPage() {
  const [page, setPage] = useState(1);
  const [awardModal, setAwardModal] = useState<LoyaltyAccount | null>(null);
  const [awardForm, setAwardForm] = useState({ points: '', description: '' });
  const [awardMsg, setAwardMsg] = useState('');

  const { data, isLoading } = useGetAdminLoyaltyAccountsQuery({ page, limit: LIMIT });
  const { data: tierBreakdown = [] } = useGetLoyaltyTierBreakdownQuery();
  const { data: loyaltyStats } = useGetLoyaltyAdminStatsQuery();
  const [awardBonus] = useAwardLoyaltyBonusMutation();

  const accounts = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const tierCounts = (['platinum', 'gold', 'silver', 'bronze'] as const).reduce(
    (acc, tier) => {
      const found = tierBreakdown.find((t) => t.tier === tier);
      acc[tier] = found?.count ?? 0;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleAward = async () => {
    if (!awardModal || !awardForm.points || !awardForm.description) return;
    try {
      await awardBonus({
        userId: awardModal.userId,
        points: Number(awardForm.points),
        description: awardForm.description,
      }).unwrap();
      setAwardMsg('Points awarded successfully!');
      setAwardForm({ points: '', description: '' });
      setTimeout(() => {
        setAwardModal(null);
        setAwardMsg('');
      }, 1500);
    } catch {
      setAwardMsg('Failed to award points.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.heading}>Loyalty Program</h1>
          {total > 0 && <p className={styles.sub}>{total} enrolled members</p>}
        </div>
      </div>

      {loyaltyStats && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Accounts', value: loyaltyStats.totalAccounts.toLocaleString(), color: '#58a6ff' },
            { label: 'In Circulation', value: loyaltyStats.totalPointsInCirculation.toLocaleString(), color: '#3fb950' },
            { label: 'Lifetime Pts', value: loyaltyStats.totalLifetimePoints.toLocaleString(), color: '#f59e0b' },
            { label: 'Redemptions', value: loyaltyStats.totalRedemptions.toLocaleString(), color: '#a371f7' },
            { label: 'Pts Redeemed', value: loyaltyStats.totalPointsRedeemed.toLocaleString(), color: '#e94560' },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, minWidth: 100, background: 'var(--color-surface)',
              border: `1px solid ${s.color}30`, borderRadius: '0.75rem',
              padding: '0.875rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
            }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.tierGrid}>
        {(['platinum', 'gold', 'silver', 'bronze'] as const).map((tier) => (
          <div key={tier} className={styles.tierCard}>
            <span className={styles.tierEmoji}>{TIER_EMOJI[tier]}</span>
            <span className={styles.tierCount}>{tierCounts[tier]}</span>
            <span className={styles.tierLabel} style={{ color: TIER_COLORS[tier] }}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.tableWrap}>
        {isLoading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</p>
        ) : (
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
              {accounts.map((acc, i) => (
                <tr key={acc.id}>
                  <td className={styles.rank}>{(page - 1) * LIMIT + i + 1}</td>
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
                    <button className={styles.awardBtn} onClick={() => setAwardModal(acc)}>
                      Award Points
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <button
            className={styles.pageBtn}
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

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
