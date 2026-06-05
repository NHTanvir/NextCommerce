'use client';

import Link from 'next/link';
import { useGetOrdersQuery } from '@/store/api/orders.api';
import { useGetLoyaltyBalanceQuery } from '@/store/api/loyalty.api';
import { useGetReferralStatsQuery } from '@/store/api/referrals.api';
import { useGetMeQuery } from '@/store/api/users.api';
import styles from './stats.module.scss';

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: string;
}) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ color }}>{icon}</div>
      <div className={styles.statBody}>
        <p className={styles.statVal} style={{ color }}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
        {sub && <p className={styles.statSub}>{sub}</p>}
      </div>
    </div>
  );
}

export default function AccountStatsPage() {
  const { data: me } = useGetMeQuery();
  const { data: orders = [] } = useGetOrdersQuery();
  const { data: loyalty } = useGetLoyaltyBalanceQuery();
  const { data: referrals } = useGetReferralStatsQuery();

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalCents ?? 0), 0);
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;

  const memberSince = me?.createdAt
    ? new Date(me.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '—';

  const statusBreakdown = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const STATUS_COLORS: Record<string, string> = {
    delivered: '#3fb950',
    shipped: '#58a6ff',
    paid: '#8957e5',
    cancelled: '#e94560',
    refunded: '#f59e0b',
    pending: '#d29922',
  };

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <div>
          <Link href="/account/orders" className={styles.backLink}>← My Account</Link>
          <h1 className={styles.title}>My Stats</h1>
          <p className={styles.sub}>Member since {memberSince}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className={styles.statsGrid}>
        <StatCard
          icon="🛒"
          label="Total Orders"
          value={orders.length}
          sub={`${deliveredCount} delivered`}
          color="#58a6ff"
        />
        <StatCard
          icon="💰"
          label="Total Spent"
          value={`$${(totalSpent / 100).toFixed(2)}`}
          sub={`avg $${(avgOrderValue / 100).toFixed(2)} per order`}
          color="#e94560"
        />
        <StatCard
          icon="⭐"
          label="Loyalty Points"
          value={(loyalty?.points ?? 0).toLocaleString()}
          sub={`${loyalty?.tier ?? 'bronze'} tier`}
          color="#ffd700"
        />
        <StatCard
          icon="👥"
          label="Referrals"
          value={referrals?.completedReferrals ?? 0}
          sub={`${referrals?.totalPointsEarned ?? 0} pts earned`}
          color="#3fb950"
        />
      </div>

      {/* Order status breakdown */}
      {orders.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Order Status Breakdown</h2>
          <div className={styles.breakdownGrid}>
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className={styles.breakdownItem}>
                <div
                  className={styles.breakdownBar}
                  style={{
                    width: `${(count / orders.length) * 100}%`,
                    backgroundColor: STATUS_COLORS[status] ?? '#8b949e',
                  }}
                />
                <div className={styles.breakdownInfo}>
                  <span className={styles.breakdownStatus}>{status}</span>
                  <span className={styles.breakdownCount}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loyalty progress */}
      {loyalty && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Loyalty Progress</h2>
          <div className={styles.loyaltyCard}>
            <div className={styles.loyaltyHeader}>
              <div>
                <span className={styles.tierBadge}>{loyalty.tier}</span>
                <p className={styles.loyaltyPoints}>{loyalty.points.toLocaleString()} pts available</p>
              </div>
              <p className={styles.lifetimePoints}>
                {loyalty.lifetimePoints.toLocaleString()} lifetime pts
              </p>
            </div>
            {loyalty.nextTierPoints !== null && (
              <div className={styles.progressWrap}>
                <p className={styles.progressText}>
                  {loyalty.nextTierPoints.toLocaleString()} more points to next tier
                </p>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${Math.min(100, 100 - (loyalty.nextTierPoints / (loyalty.lifetimePoints + loyalty.nextTierPoints)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recent spending */}
      {orders.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <div className={styles.recentList}>
            {orders.slice(0, 5).map((o) => (
              <Link key={o.id} href={`/account/orders/${o.id}`} className={styles.recentItem}>
                <span className={styles.recentId}>#{o.id.slice(-8).toUpperCase()}</span>
                <span
                  className={styles.recentStatus}
                  style={{ color: STATUS_COLORS[o.status] ?? '#8b949e' }}
                >
                  {o.status}
                </span>
                <span className={styles.recentAmt}>${(o.totalCents / 100).toFixed(2)}</span>
              </Link>
            ))}
          </div>
          <Link href="/account/orders" className={styles.viewAllLink}>
            View all orders →
          </Link>
        </section>
      )}
    </div>
  );
}
