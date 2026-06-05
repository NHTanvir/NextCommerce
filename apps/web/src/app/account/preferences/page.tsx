'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useResetNotificationPreferencesMutation,
  type UpdateNotificationPreferencesDto,
} from '@/store/api/notification-preferences.api';
import styles from './preferences.module.scss';

interface ToggleRowProps {
  label: string;
  description: string;
  icon: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({ label, description, icon, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <label className={`${styles.toggleRow} ${disabled ? styles.disabled : ''}`}>
      <span className={styles.toggleIcon}>{icon}</span>
      <span className={styles.toggleText}>
        <span className={styles.toggleLabel}>{label}</span>
        <span className={styles.toggleDesc}>{description}</span>
      </span>
      <button
        role="switch"
        aria-checked={checked}
        className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
        onClick={() => !disabled && onChange(!checked)}
        type="button"
      >
        <span className={styles.toggleThumb} />
      </button>
    </label>
  );
}

export default function PreferencesPage() {
  const { data: prefs, isLoading } = useGetNotificationPreferencesQuery();
  const [update] = useUpdateNotificationPreferencesMutation();
  const [reset] = useResetNotificationPreferencesMutation();
  const [saved, setSaved] = useState(false);

  const [local, setLocal] = useState<UpdateNotificationPreferencesDto>({});

  useEffect(() => {
    if (prefs) {
      setLocal({
        orderUpdates: prefs.orderUpdates,
        promotionalEmails: prefs.promotionalEmails,
        lowStockAlerts: prefs.lowStockAlerts,
        newsletterDigest: prefs.newsletterDigest,
        pushNotifications: prefs.pushNotifications,
        smsAlerts: prefs.smsAlerts,
      });
    }
  }, [prefs]);

  const handleChange = async (key: keyof UpdateNotificationPreferencesDto, value: boolean) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    await update({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = async () => {
    await reset();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const get = (key: keyof UpdateNotificationPreferencesDto): boolean =>
    local[key] ?? prefs?.[key] ?? false;

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <Link href="/account" className={styles.backLink}>← My Account</Link>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Notification Preferences</h1>
            <p className={styles.sub}>Control what communications you receive from NextCommerce</p>
          </div>
          {saved && <span className={styles.savedBadge}>✓ Saved</span>}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          {[...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Order & Transactional</h2>
            <div className={styles.rows}>
              <ToggleRow
                icon="📦"
                label="Order Updates"
                description="Shipping confirmations, delivery notifications, and status changes"
                checked={get('orderUpdates')}
                onChange={(v) => handleChange('orderUpdates', v)}
              />
              <ToggleRow
                icon="📉"
                label="Low Stock Alerts"
                description="Get notified when items in your wishlist are running low"
                checked={get('lowStockAlerts')}
                onChange={(v) => handleChange('lowStockAlerts', v)}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Marketing & Promotions</h2>
            <div className={styles.rows}>
              <ToggleRow
                icon="📣"
                label="Promotional Emails"
                description="Flash sales, exclusive offers, and member-only deals"
                checked={get('promotionalEmails')}
                onChange={(v) => handleChange('promotionalEmails', v)}
              />
              <ToggleRow
                icon="📰"
                label="Newsletter Digest"
                description="Weekly curated products, brand stories, and style inspiration"
                checked={get('newsletterDigest')}
                onChange={(v) => handleChange('newsletterDigest', v)}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Channels</h2>
            <div className={styles.rows}>
              <ToggleRow
                icon="📱"
                label="Push Notifications"
                description="Mobile and browser push alerts for real-time updates"
                checked={get('pushNotifications')}
                onChange={(v) => handleChange('pushNotifications', v)}
              />
              <ToggleRow
                icon="💬"
                label="SMS Alerts"
                description="Text messages for shipping updates and time-sensitive offers"
                checked={get('smsAlerts')}
                onChange={(v) => handleChange('smsAlerts', v)}
              />
            </div>
          </section>

          <div className={styles.footer}>
            <button className={styles.resetBtn} onClick={handleReset} type="button">
              Reset to Defaults
            </button>
            <p className={styles.footerNote}>
              You can always manage your preferences here or unsubscribe via any email.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
