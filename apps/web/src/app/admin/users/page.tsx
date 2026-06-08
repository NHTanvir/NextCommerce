'use client';

import { useState } from 'react';
import { useListUsersQuery, useDeleteUserMutation, useGetAdminUserStatsQuery } from '@/store/api/users.api';
import styles from './users.module.scss';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListUsersQuery({ page, limit: 20 });
  const { data: stats } = useGetAdminUserStatsQuery();
  const [deleteUser] = useDeleteUserMutation();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await deleteUser(id).unwrap();
    } catch {
      alert('Failed to delete user.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Users</h1>
        <span className={styles.count}>{stats?.total ?? data?.total ?? 0} total</span>
      </div>

      {stats && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Users', value: stats.total, color: '#58a6ff' },
            { label: 'Customers', value: stats.customers, color: '#3fb950' },
            { label: 'Admins', value: stats.admins, color: '#8957e5' },
            { label: 'New This Month', value: stats.newThisMonth, color: '#f59e0b' },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, minWidth: 120, background: 'var(--color-surface)',
              border: `1px solid ${s.color}30`, borderRadius: '0.75rem',
              padding: '0.875rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value.toLocaleString()}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {isLoading && <p style={{ color: 'var(--color-text-muted)', padding: '1rem' }}>Loading users…</p>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((user) => (
              <tr key={user.id}>
                <td className={styles.name}>{user.name}</td>
                <td className={styles.email}>{user.email}</td>
                <td>
                  <span className={`${styles.badge} ${user.role === 'admin' ? styles.admin : styles.customer}`}>
                    {user.role}
                  </span>
                </td>
                <td className={styles.date}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(user.id, user.name)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(data?.totalPages ?? 1) > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span className={styles.pageInfo}>Page {page} of {data?.totalPages}</span>
          <button
            className={styles.pageBtn}
            disabled={page === data?.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
