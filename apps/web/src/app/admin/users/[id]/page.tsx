'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGetUserByIdQuery, useDeleteUserMutation } from '@/store/api/users.api';
import { useGetOrdersForUserQuery } from '@/store/api/orders.api';
import styles from './user-detail.module.scss';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useGetUserByIdQuery(id);
  const { data: orders } = useGetOrdersForUserQuery(id);
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    await deleteUser(id).unwrap();
    setDeleted(true);
  };

  if (deleted) {
    return (
      <div className={styles.page}>
        <div className={styles.successBox}>User has been deleted.</div>
        <Link href="/admin/users" className="btn btn--outline">← Back to Users</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <h2>User not found</h2>
        <Link href="/admin/users" className="btn btn--outline">← Back</Link>
      </div>
    );
  }

  const totalSpent = orders?.reduce((sum, o) => sum + (o.totalCents ?? 0), 0) ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/admin/users" className={styles.backLink}>← Users</Link>
        <h1 className={styles.heading}>{user.name}</h1>
        <span className={user.role === 'admin' ? styles.badgeAdmin : styles.badgeCustomer}>
          {user.role}
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          {/* Profile card */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Profile</h2>
            <div className={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Name</span>
                <span>{user.name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Email</span>
                <span>{user.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>User ID</span>
                <span className={styles.mono}>{user.id}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Joined</span>
                <span>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Role</span>
                <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Order Statistics</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <p className={styles.statVal}>{orders?.length ?? 0}</p>
                <p className={styles.statKey}>Total Orders</p>
              </div>
              <div className={styles.statBox}>
                <p className={styles.statVal}>${(totalSpent / 100).toFixed(2)}</p>
                <p className={styles.statKey}>Total Spent</p>
              </div>
              <div className={styles.statBox}>
                <p className={styles.statVal}>
                  {orders?.filter((o) => o.status === 'delivered').length ?? 0}
                </p>
                <p className={styles.statKey}>Delivered</p>
              </div>
              <div className={styles.statBox}>
                <p className={styles.statVal}>
                  {orders?.filter((o) => o.status === 'cancelled').length ?? 0}
                </p>
                <p className={styles.statKey}>Cancelled</p>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.rightCol}>
          {/* Recent orders */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Recent Orders</h2>
            {!orders || orders.length === 0 ? (
              <p className={styles.empty}>No orders yet.</p>
            ) : (
              <div className={styles.orderList}>
                {orders.slice(0, 10).map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/orders/${o.id}`}
                    className={styles.orderRow}
                  >
                    <span className={styles.mono}>#{o.id.slice(-8).toUpperCase()}</span>
                    <span className={styles.orderStatus} data-status={o.status}>
                      {o.status}
                    </span>
                    <span className={styles.orderAmt}>
                      ${(o.totalCents / 100).toFixed(2)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Danger zone */}
          {user.role !== 'admin' && (
            <section className={styles.dangerZone}>
              <h3 className={styles.dangerTitle}>Danger Zone</h3>
              {!showConfirm ? (
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => setShowConfirm(true)}
                >
                  Delete User Account
                </button>
              ) : (
                <div className={styles.confirmBox}>
                  <p>
                    Delete <strong>{user.name}</strong> and all their data? This cannot be undone.
                  </p>
                  <div className={styles.confirmActions}>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting…' : 'Confirm Delete'}
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
