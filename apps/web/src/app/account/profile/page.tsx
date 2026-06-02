'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout, setUser } from '@/store/slices/auth.slice';
import { useUpdateMeMutation, useChangePasswordMutation } from '@/store/api/users.api';
import styles from './profile.module.scss';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [editName, setEditName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [nameMsg, setNameMsg] = useState('');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  const [updateMe, { isLoading: updatingName }] = useUpdateMeMutation();
  const [changePassword, { isLoading: changingPw }] = useChangePasswordMutation();

  useEffect(() => {
    if (!user) router.push('/auth/login');
    else setEditName(user.name);
  }, [user, router]);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('nc_token');
    localStorage.removeItem('nc_user');
    router.push('/');
  };

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateMe({ name: editName }).unwrap();
      dispatch(setUser({ ...user, name: updated.name }));
      setNameMsg('Name updated successfully.');
      setEditMode(false);
    } catch {
      setNameMsg('Failed to update name.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) {
      setPwMsg('New password must be at least 8 characters.');
      return;
    }
    try {
      await changePassword({ currentPassword: currentPw, newPassword: newPw }).unwrap();
      setPwMsg('Password updated successfully.');
      setCurrentPw('');
      setNewPw('');
    } catch {
      setPwMsg('Failed to update password. Check your current password.');
    }
  };

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>My Profile</h1>

      <div className={styles.card}>
        <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
        <div className={styles.info}>
          <h2 className={styles.name}>{user.name}</h2>
          <p className={styles.email}>{user.email}</p>
          <span className={`badge badge--${user.role === 'admin' ? 'accent' : 'success'}`}>
            {user.role}
          </span>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Edit Name</h3>
          {!editMode && (
            <button className="btn btn--ghost btn--sm" onClick={() => setEditMode(true)}>
              Edit
            </button>
          )}
        </div>
        {editMode ? (
          <form className={styles.form} onSubmit={handleNameSave}>
            <input
              className={styles.input}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Full name"
              required
              minLength={2}
            />
            <div className={styles.formActions}>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditMode(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary btn--sm" disabled={updatingName}>
                {updatingName ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <p className={styles.fieldValue}>{user.name}</p>
        )}
        {nameMsg && <p className={styles.msg}>{nameMsg}</p>}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Change Password</h3>
        <form className={styles.form} onSubmit={handlePasswordChange}>
          <input
            type="password"
            className={styles.input}
            placeholder="Current password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            required
          />
          <input
            type="password"
            className={styles.input}
            placeholder="New password (min 8 chars)"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            required
            minLength={8}
          />
          <div className={styles.formActions}>
            <button type="submit" className="btn btn--primary btn--sm" disabled={changingPw}>
              {changingPw ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
        {pwMsg && <p className={styles.msg}>{pwMsg}</p>}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Account Details</h3>
        {[
          { label: 'Email', value: user.email },
          { label: 'Role', value: user.role },
          { label: 'Member ID', value: user.id, mono: true },
        ].map(({ label, value, mono }) => (
          <div key={label} className={styles.detailRow}>
            <span className={styles.detailLabel}>{label}</span>
            <span className={styles.detailValue} style={mono ? { fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' } : {}}>
              {value}
            </span>
          </div>
        ))}
      </section>

      <button className="btn btn--outline" onClick={handleLogout} style={{ alignSelf: 'flex-start', color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}>
        Sign Out
      </button>
    </div>
  );
}
