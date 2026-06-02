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
      // error displayed via RTK state
    }
  };

  if (subscribed) {
    return (
      <div className={styles.success}>
        <span className={styles.successIcon}>✓</span>
        <p className={styles.successText}>You're subscribed! Look out for deals in your inbox.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Get exclusive deals</h3>
      <p className={styles.subtitle}>Subscribe for early access to sales, new drops, and members-only discounts.</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="email"
          className={styles.input}
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className={styles.btn} disabled={isLoading}>
          {isLoading ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
      {error && (
        <p className={styles.error}>Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
