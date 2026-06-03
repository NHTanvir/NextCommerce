'use client';

import { useState } from 'react';
import { useGetLoyaltyBalanceQuery, useGetLoyaltyHistoryQuery, useRedeemPointsMutation } from '@/store/api/loyalty.api';
import styles from './LoyaltyWidget.module.scss';

const TIER_ICONS: Record<string, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
};

const TIER_COLORS: Record<string, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
};

export function LoyaltyWidget() {
  const { data: balance, isLoading } = useGetLoyaltyBalanceQuery();
  const { data: history = [] } = useGetLoyaltyHistoryQuery(10);
  const [redeemPoints, { isLoading: redeeming }] = useRedeemPointsMutation();
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemMsg, setRedeemMsg] = useState('');

  if (isLoading) {
    return <div className={styles.skeleton} style={{ height: 200, borderRadius: 12 }} />;
  }

  if (!balance) return null;

  const tierColor = TIER_COLORS[balance.tier] ?? '#cd7f32';
  const tierIcon = TIER_ICONS[balance.tier] ?? '🥉';

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const pts = Number(redeemAmount);
    if (pts < 100) { setRedeemMsg('Minimum 100 points to redeem.'); return; }
    try {
      const result = await redeemPoints(pts).unwrap();
      setRedeemMsg(`Redeemed! You got a $${(result.discountCents / 100).toFixed(2)} discount.`);
      setRedeemAmount('');
    } catch (err: any) {
      setRedeemMsg(err?.data?.message ?? 'Failed to redeem points.');
    }
  };

  const progressPct = balance.nextTierPoints
    ? Math.min(100, 100 - (balance.nextTierPoints / 500) * 100)
    : 100;

  return (
    <div className={styles.widget}>
      {/* Header */}
      <div className={styles.header} style={{ borderColor: tierColor }}>
        <div className={styles.tierInfo}>
          <span className={styles.tierIcon}>{tierIcon}</span>
          <div>
            <p className={styles.tierLabel} style={{ color: tierColor }}>
              {balance.tier.charAt(0).toUpperCase() + balance.tier.slice(1)} Member
            </p>
            <p className={styles.lifetimePts}>{balance.lifetimePoints.toLocaleString()} lifetime pts</p>
          </div>
        </div>
        <div className={styles.pointsBadge}>
          <span className={styles.pointsNum}>{balance.points.toLocaleString()}</span>
          <span className={styles.pointsLabel}>pts</span>
        </div>
      </div>

      {/* Progress to next tier */}
      {balance.nextTierPoints !== null && (
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%`, background: tierColor }} />
          </div>
          <p className={styles.progressText}>
            {balance.nextTierPoints.toLocaleString()} pts to next tier
          </p>
        </div>
      )}

      {/* Redeem form */}
      <form className={styles.redeemForm} onSubmit={handleRedeem}>
        <label className={styles.redeemLabel}>Redeem Points</label>
        <div className={styles.redeemRow}>
          <input
            className={styles.redeemInput}
            type="number"
            min={100}
            step={100}
            max={balance.points}
            placeholder="100"
            value={redeemAmount}
            onChange={(e) => { setRedeemAmount(e.target.value); setRedeemMsg(''); }}
          />
          <span className={styles.redeemHint}>
            = ${redeemAmount ? ((Number(redeemAmount) / 100)).toFixed(2) : '0.00'} off
          </span>
          <button
            type="submit"
            className="btn btn--primary btn--sm"
            disabled={redeeming || !redeemAmount || Number(redeemAmount) > balance.points}
          >
            {redeeming ? '…' : 'Redeem'}
          </button>
        </div>
        {redeemMsg && <p className={styles.redeemMsg}>{redeemMsg}</p>}
      </form>

      {/* Recent history */}
      {history.length > 0 && (
        <div className={styles.history}>
          <p className={styles.historyTitle}>Recent Activity</p>
          {history.slice(0, 5).map((tx) => (
            <div key={tx.id} className={styles.txRow}>
              <div className={styles.txLeft}>
                <span className={styles.txType}>{tx.type}</span>
                <span className={styles.txDesc}>{tx.description}</span>
              </div>
              <span
                className={styles.txPoints}
                style={{ color: tx.points > 0 ? '#3fb950' : '#e94560' }}
              >
                {tx.points > 0 ? '+' : ''}{tx.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
