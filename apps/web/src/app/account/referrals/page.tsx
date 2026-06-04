'use client';

import { useState } from 'react';
import {
  useGetMyReferralCodeQuery,
  useGetReferralStatsQuery,
  useGetReferralHistoryQuery,
} from '@/store/api/referrals.api';
import styles from './referrals.module.scss';

function copyToClipboard(text: string, setCopied: (v: boolean) => void) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  });
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  completed: '#3fb950',
  paid: '#58a6ff',
};

export default function ReferralsPage() {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const { data: codeData } = useGetMyReferralCodeQuery();
  const { data: stats, isLoading } = useGetReferralStatsQuery();
  const { data: history = [] } = useGetReferralHistoryQuery();

  const referralLink = codeData
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/register?ref=${codeData.code}`
    : '';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Refer & Earn</h1>
        <p className={styles.sub}>
          Earn 500 points for each friend who makes their first purchase. Your friend gets 250 points too!
        </p>
      </div>

      {/* Stats cards */}
      {!isLoading && stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.totalReferrals}</span>
            <span className={styles.statLabel}>Total Referrals</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.completedReferrals}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.pendingReferrals}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
          <div className={`${styles.statCard} ${styles.highlightCard}`}>
            <span className={styles.statValue}>{stats.totalPointsEarned.toLocaleString()}</span>
            <span className={styles.statLabel}>Points Earned</span>
          </div>
        </div>
      )}

      {/* Share section */}
      <div className={styles.shareCard}>
        <h3 className={styles.shareTitle}>Your Referral Code</h3>

        <div className={styles.codeRow}>
          <span className={styles.code}>{codeData?.code ?? '—'}</span>
          <button
            className={styles.copyBtn}
            onClick={() => codeData && copyToClipboard(codeData.code, setCodeCopied)}
          >
            {codeCopied ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>

        {referralLink && (
          <div className={styles.linkRow}>
            <span className={styles.link}>{referralLink}</span>
            <button
              className={styles.copyBtn}
              onClick={() => copyToClipboard(referralLink, setLinkCopied)}
            >
              {linkCopied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        )}

        <p className={styles.shareHint}>
          Share your code or link with friends. You'll earn points once they complete their first order.
        </p>
      </div>

      {/* How it works */}
      <div className={styles.stepsCard}>
        <h3 className={styles.stepsTitle}>How It Works</h3>
        <div className={styles.steps}>
          {[
            { step: '1', title: 'Share your code', body: 'Send your unique referral link to friends.' },
            { step: '2', title: 'Friend signs up', body: 'They register and apply your code.' },
            { step: '3', title: 'Both earn points', body: 'Friend gets 250 pts, you get 500 pts after their first order.' },
          ].map((s) => (
            <div key={s.step} className={styles.step}>
              <span className={styles.stepNum}>{s.step}</span>
              <div>
                <p className={styles.stepTitle}>{s.title}</p>
                <p className={styles.stepBody}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className={styles.historySection}>
          <h3 className={styles.historyTitle}>Referral History</h3>
          <div className={styles.historyList}>
            {history.map((r) => (
              <div key={r.id} className={styles.historyRow}>
                <div>
                  <p className={styles.historyId}>Referral {r.id.slice(0, 8)}…</p>
                  <p className={styles.historyDate}>
                    {new Date(r.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className={styles.historyRight}>
                  <span
                    className={styles.statusBadge}
                    style={{ background: `${STATUS_COLORS[r.status]}20`, color: STATUS_COLORS[r.status] }}
                  >
                    {r.status}
                  </span>
                  {r.rewardPointsGranted && (
                    <span className={styles.points}>+{r.rewardPointsGranted} pts</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
