'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useGetLoyaltyBalanceQuery } from '@/store/api/loyalty.api';
import { useGetOrdersQuery } from '@/store/api/orders.api';
import styles from './account.module.scss';

const ACCOUNT_LINKS = [
  { href: '/account/orders', icon: '📦', label: 'My Orders', desc: 'Track and manage your orders' },
  { href: '/account/profile', icon: '👤', label: 'Profile', desc: 'Edit your name and password' },
  { href: '/account/addresses', icon: '📍', label: 'Addresses', desc: 'Manage shipping addresses' },
  { href: '/account/loyalty', icon: '⭐', label: 'Loyalty Rewards', desc: 'Points, tier, and rewards' },
  { href: '/account/referrals', icon: '👥', label: 'Referrals', desc: 'Invite friends, earn points' },
  { href: '/account/returns', icon: '↩️', label: 'Returns', desc: 'View and request returns' },
  { href: '/account/reviews', icon: '⭐', label: 'My Reviews', desc: 'Reviews you have submitted' },
  { href: '/account/notifications', icon: '🔔', label: 'Notifications', desc: 'View all notifications' },
  { href: '/account/preferences', icon: '⚙️', label: 'Preferences', desc: 'Email and push notification settings' },
  { href: '/account/stats', icon: '📊', label: 'My Stats', desc: 'Spending summary and insights' },
  { href: '/account/price-alerts', icon: '📉', label: 'Price Alerts', desc: 'Track price drops on products' },
  { href: '/account/activity', icon: '📋', label: 'Activity Log', desc: 'Recent account actions' },
];

export default function AccountPage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const { data: orders = [] } = useGetOrdersQuery();
  const { data: loyalty } = useGetLoyaltyBalanceQuery();

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user, router]);

  if (!user) return null;

  const recentOrder = orders[0];
  const pendingCount = orders.filter((o) => ['paid', 'processing', 'shipped'].includes(o.status)).length;

  return (
    <div className={`container ${styles.page}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
        <div className={styles.headerInfo}>
          <h1 className={styles.greeting}>Hi, {user.name.split(' ')[0]}!</h1>
          <p className={styles.email}>{user.email}</p>
          {loyalty && (
            <span className={styles.tierBadge}>{loyalty.tier} · {loyalty.points.toLocaleString()} pts</span>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className={styles.quickStats}>
        <div className={styles.quickStat}>
          <span className={styles.quickStatNum}>{orders.length}</span>
          <span className={styles.quickStatLabel}>Orders</span>
        </div>
        <div className={styles.quickStat}>
          <span className={styles.quickStatNum} style={{ color: '#f59e0b' }}>{pendingCount}</span>
          <span className={styles.quickStatLabel}>In Progress</span>
        </div>
        <div className={styles.quickStat}>
          <span className={styles.quickStatNum} style={{ color: '#ffd700' }}>
            {(loyalty?.points ?? 0).toLocaleString()}
          </span>
          <span className={styles.quickStatLabel}>Points</span>
        </div>
      </div>

      {/* Recent order banner */}
      {recentOrder && (
        <Link href={`/account/orders/${recentOrder.id}`} className={styles.recentOrder}>
          <div className={styles.recentOrderLeft}>
            <span className={styles.recentOrderIcon}>📦</span>
            <div>
              <p className={styles.recentOrderTitle}>Recent Order</p>
              <p className={styles.recentOrderId}>#{recentOrder.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <div className={styles.recentOrderRight}>
            <span
              className={styles.recentOrderStatus}
              style={{
                color: recentOrder.status === 'delivered' ? '#3fb950'
                  : recentOrder.status === 'shipped' ? '#58a6ff'
                  : '#f59e0b',
              }}
            >
              {recentOrder.status}
            </span>
            <span className={styles.recentOrderArrow}>›</span>
          </div>
        </Link>
      )}

      {/* Menu grid */}
      <div className={styles.grid}>
        {ACCOUNT_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={styles.menuCard}>
            <span className={styles.menuIcon}>{link.icon}</span>
            <div className={styles.menuBody}>
              <p className={styles.menuLabel}>{link.label}</p>
              <p className={styles.menuDesc}>{link.desc}</p>
            </div>
            <span className={styles.menuArrow}>›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
