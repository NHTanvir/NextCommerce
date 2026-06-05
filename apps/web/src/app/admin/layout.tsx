'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import styles from './admin.module.scss';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Products', icon: '👟' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
  { href: '/admin/inventory', label: 'Inventory', icon: '📋' },
  { href: '/admin/returns', label: 'Returns', icon: '↩️' },
  { href: '/admin/promotions', label: 'Promotions', icon: '🏷️' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { href: '/admin/collections', label: 'Collections', icon: '📚' },
  { href: '/admin/bundles', label: 'Bundles', icon: '🎁' },
  { href: '/admin/loyalty', label: 'Loyalty', icon: '⭐' },
  { href: '/admin/newsletter', label: 'Newsletter', icon: '📧' },
  { href: '/admin/qna', label: 'Q&A', icon: '💬' },
  { href: '/admin/stock-alerts', label: 'Stock Alerts', icon: '🔔' },
  { href: '/admin/reports', label: 'Reports', icon: '📊' },
  { href: '/admin/audit', label: 'Audit Log', icon: '🔍' },
  { href: '/admin/gift-cards', label: 'Gift Cards', icon: '🎁' },
  { href: '/admin/referrals', label: 'Referrals', icon: '🔗' },
  { href: '/admin/import', label: 'Import', icon: '📥' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'admin') router.push('/');
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Admin</div>
        <nav className={styles.nav}>
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
