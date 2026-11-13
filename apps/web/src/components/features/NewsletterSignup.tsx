'use client';

import { useState } from 'react';
import { useSubscribeMutation } from '@/store/api/newsletter.api';
import styles from './NewsletterSignup.module.scss';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribe, { isLoading, error }] = useSubscribeMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await subscribe({ email: email.trim().toLowerCase() }).unwrap();
      setSubscribed(true);
      setEmail('');
    } catch {
      // surfaced through the error branch below
    }
  };

  return (
    <aside className={styles.band}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.copy}>
        <p className={styles.kicker}>Newsletter</p>
        <h3 className={styles.title}>
          {subscribed ? "You're on the list" : 'Get the drops before they sell out'}
        </h3>
        <p className={styles.subtitle}>
          {subscribed
            ? 'Early access and member pricing land in your inbox from the next drop onwards.'
            : 'Early access to sales, new arrivals and member-only pricing. One email a week, never more.'}
        </p>
      </div>

      {subscribed ? (
        <p className={styles.success}>
          <span className={styles.successIcon} aria-hidden="true">
            ✓
          </span>
          Subscribed
        </p>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <input
              type="email"
              className={styles.input}
              placeholder="your@email.com"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className={styles.btn} disabled={isLoading}>
              {isLoading ? 'Subscribing…' : 'Subscribe'}
            </button>
          </div>
          <p className={error ? styles.error : styles.note}>
            {error
              ? 'Something went wrong. Please try again.'
              : 'No spam. Unsubscribe in one click.'}
          </p>
        </form>
      )}
    </aside>
  );
}
