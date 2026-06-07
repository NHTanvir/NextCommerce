'use client';

import { useState } from 'react';
import {
  useAdminGetGiftCardsQuery,
  useAdminDeleteGiftCardMutation,
  useAdminIssueGiftCardMutation,
  useAdminGetGiftCardStatsQuery,
} from '@/store/api/gift-cards.api';
import styles from '../admin.module.scss';

const AMOUNTS = [2500, 5000, 10000, 25000, 50000, 100000];

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminGiftCardsPage() {
  const [page, setPage] = useState(1);
  const [showIssue, setShowIssue] = useState(false);
  const [issueForm, setIssueForm] = useState({
    amountCents: 5000,
    recipientEmail: '',
    recipientName: '',
    message: '',
    expiresAt: '',
  });

  const { data, isLoading, isFetching } = useAdminGetGiftCardsQuery({ page, limit: 20 });
  const { data: stats } = useAdminGetGiftCardStatsQuery();
  const [deleteCard] = useAdminDeleteGiftCardMutation();
  const [issueCard, { isLoading: issuing }] = useAdminIssueGiftCardMutation();

  const loading = isLoading || isFetching;

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    try {
      await issueCard({
        amountCents: issueForm.amountCents,
        recipientEmail: issueForm.recipientEmail || undefined,
        recipientName: issueForm.recipientName || undefined,
        message: issueForm.message || undefined,
        expiresAt: issueForm.expiresAt || undefined,
      }).unwrap();
      setShowIssue(false);
      setIssueForm({ amountCents: 5000, recipientEmail: '', recipientName: '', message: '', expiresAt: '' });
    } catch {
      // ignore
    }
  }

  const totalCards = stats?.total ?? data?.total ?? 0;
  const totalValue = stats?.totalIssuedCents ?? 0;
  const totalRemaining = stats?.totalRemainingCents ?? 0;
  const totalRedeemed = stats?.totalRedeemedCents ?? 0;
  const activeCards = stats?.active ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.dashHeader}>
        <h1 className={styles.pageTitle}>Gift Cards</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setShowIssue(true)}>
          + Issue Gift Card
        </button>
      </div>

      {/* Summary */}
      <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ color: '#e94560', background: '#e9456018' }}>🎁</div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{totalCards}</span>
            <span className={styles.statLabel}>Total Issued</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ color: '#10b981', background: '#10b98118' }}>✅</div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{activeCards}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ color: '#3b82f6', background: '#3b82f618' }}>💳</div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{fmt(totalValue)}</span>
            <span className={styles.statLabel}>Total Issued Value</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ color: '#10b981', background: '#10b98118' }}>💰</div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{fmt(totalRemaining)}</span>
            <span className={styles.statLabel}>Remaining Balance</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ color: '#f59e0b', background: '#f59e0b18' }}>🏷️</div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{fmt(totalRedeemed)}</span>
            <span className={styles.statLabel}>Total Redeemed</span>
          </div>
        </div>
      </div>

      {/* Issue form modal */}
      {showIssue && (
        <div className={styles.tableWrap} style={{ padding: '1.5rem' }}>
          <div className={styles.tableHeader} style={{ padding: '0 0 1rem 0', border: 'none' }}>
            <h2 className={styles.tableTitle}>Issue New Gift Card</h2>
            <button className="btn btn--ghost btn--sm" onClick={() => setShowIssue(false)}>✕ Cancel</button>
          </div>
          <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 480 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-muted)' }}>
                Amount
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setIssueForm((f) => ({ ...f, amountCents: a }))}
                    style={{
                      padding: '0.375rem 0.875rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${issueForm.amountCents === a ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: issueForm.amountCents === a ? 'rgba(233,69,96,0.1)' : 'var(--color-bg-card)',
                      color: issueForm.amountCents === a ? 'var(--color-accent)' : 'var(--color-text)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    {fmt(a)}
                  </button>
                ))}
              </div>
            </div>
            {(['recipientEmail', 'recipientName', 'message'] as const).map((field) => (
              <div key={field}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                  {field.replace(/([A-Z])/g, ' $1')} <span style={{ opacity: 0.5 }}>(optional)</span>
                </label>
                <input
                  type={field === 'recipientEmail' ? 'email' : 'text'}
                  value={issueForm[field]}
                  onChange={(e) => setIssueForm((f) => ({ ...f, [field]: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-card)',
                    color: 'var(--color-text)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-muted)' }}>
                Expiry Date <span style={{ opacity: 0.5 }}>(optional)</span>
              </label>
              <input
                type="date"
                value={issueForm.expiresAt}
                onChange={(e) => setIssueForm((f) => ({ ...f, expiresAt: e.target.value }))}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-card)',
                  color: 'var(--color-text)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <button type="submit" className="btn btn--primary" disabled={issuing} style={{ width: 'fit-content' }}>
              {issuing ? 'Issuing…' : `Issue ${fmt(issueForm.amountCents)} Gift Card`}
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>All Gift Cards</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            {totalCards} total
          </span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Recipient</th>
              <th>Initial</th>
              <th>Remaining</th>
              <th>Status</th>
              <th>Expires</th>
              <th>Issued</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className={styles.emptyCell}>Loading…</td></tr>
            )}
            {!loading && data?.data.map((card) => (
              <tr key={card.id}>
                <td>
                  <code style={{ fontSize: '0.8125rem', color: 'var(--color-accent)', fontFamily: 'monospace' }}>
                    {card.code}
                  </code>
                </td>
                <td style={{ color: 'var(--color-text-muted)' }}>
                  {card.recipientEmail ?? '—'}
                  {card.recipientName && (
                    <div style={{ fontSize: '0.75rem' }}>{card.recipientName}</div>
                  )}
                </td>
                <td>{fmt(card.initialAmountCents)}</td>
                <td style={{ fontWeight: 700 }}>{fmt(card.remainingAmountCents)}</td>
                <td>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.15rem 0.625rem',
                      borderRadius: 100,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: card.isActive ? '#10b981' : '#8b949e',
                      background: card.isActive ? '#10b98120' : '#8b949e20',
                    }}
                  >
                    {card.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className={styles.dateCell}>
                  {card.expiresAt
                    ? new Date(card.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Never'}
                </td>
                <td className={styles.dateCell}>
                  {new Date(card.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td>
                  <button
                    onClick={() => deleteCard(card.id)}
                    style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(233,69,96,0.3)',
                      background: 'transparent',
                      color: 'var(--color-accent)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
            {!loading && (!data?.data.length) && (
              <tr><td colSpan={8} className={styles.emptyCell}>No gift cards issued yet.</td></tr>
            )}
          </tbody>
        </table>

        {data && data.totalPages > 1 && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem 1.25rem', borderTop: '1px solid var(--color-border)' }}>
            <button className="btn btn--ghost btn--sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Page {page} of {data.totalPages}</span>
            <button className="btn btn--ghost btn--sm" disabled={page === data.totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
