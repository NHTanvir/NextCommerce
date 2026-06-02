'use client';

import { useState } from 'react';
import { useListUsersQuery, useDeleteUserMutation } from '@/store/api/users.api';
import styles from './users.module.scss';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListUsersQuery({ page, limit: 20 });
  const [deleteUser] = useDeleteUserMutation();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await deleteUser(id).unwrap();
    } catch {
      alert('Failed to delete user.');
    }
  };

  if (isLoading) return <div className={styles.loading}>Loading users…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Users</h1>
        <span className={styles.count}>{data?.total ?? 0} total</span>
      </div>

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
                <td className={styles.date}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(user.id, user.name)}
                  >
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
          <button
            className={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {data?.totalPages}
          </span>
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
