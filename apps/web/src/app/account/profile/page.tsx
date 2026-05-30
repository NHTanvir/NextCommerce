'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/auth.slice';
import styles from './profile.module.scss';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user, router]);

  if (!user) return null;

  function handleLogout() {
    dispatch(logout());
    localStorage.removeItem('nc_token');
    localStorage.removeItem('nc_user');
    router.push('/');
  }

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>My Profile</h1>

      <div className={styles.card}>
        <div className={styles.avatar}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.info}>
          <h2 className={styles.name}>{user.name}</h2>
          <p className={styles.email}>{user.email}</p>
          <span className={`badge badge--${user.role === 'admin' ? 'accent' : 'success'}`}>
            {user.role}
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Account Details</h3>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Name</span>
          <span className={styles.detailValue}>{user.name}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Email</span>
          <span className={styles.detailValue}>{user.email}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Role</span>
          <span className={styles.detailValue} style={{ textTransform: 'capitalize' }}>{user.role}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Member ID</span>
          <span className={styles.detailValue} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
            {user.id}
          </span>
        </div>
      </div>

      <button className="btn btn--outline" onClick={handleLogout} style={{ alignSelf: 'flex-start', color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}>
        Sign Out
      </button>
    </div>
  );
}
