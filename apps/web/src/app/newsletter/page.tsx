'use client';

import { useState } from 'react';
import styles from './newsletter.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const PREFERENCES = [
  { id: 'new_arrivals', label: 'New Arrivals', desc: 'First to know about latest drops' },
  { id: 'promotions', label: 'Sales & Promotions', desc: 'Exclusive discounts and offers' },
  { id: 'restocks', label: 'Restocks & Back in Stock', desc: 'Alerts when sold-out items return' },
  { id: 'seasonal', label: 'Seasonal Collections', desc: 'Summer, winter, holiday campaigns' },
  { id: 'collaborations', label: 'Brand Collaborations', desc: 'Special limited-edition releases' },
  { id: 'tips', label: 'Style & Care Tips', desc: 'How to style and maintain your footwear' },
];

type Step = 'form' | 'success' | 'unsubscribe' | 'unsubscribed';

export default function NewsletterPage() {
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [prefs, setPrefs] = useState<Set<string>>(new Set(['new_arrivals', 'promotions']));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [unsubEmail, setUnsubEmail] = useState('');

  const togglePref = (id: string) => {
    setPrefs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          preferences: [...prefs],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Subscription failed');
      }
      setStep('success');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unsubEmail.trim()) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/newsletter/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unsubEmail.trim() }),
      });
      setStep('unsubscribed');
    } catch {
      // silently succeed — don't reveal if email exists
      setStep('unsubscribed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>📧</div>
        <h1 className={styles.title}>Stay in the Loop</h1>
        <p className={styles.subtitle}>
          Join 50,000+ sneaker fans who get exclusive deals, early access, and new arrivals straight to their inbox.
        </p>
      </div>

      <div className={styles.container}>
        {step === 'form' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Subscribe to our Newsletter</h2>

            <form onSubmit={handleSubscribe} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="nl-name">Name (optional)</label>
                <input
                  id="nl-name"
                  type="text"
                  className={styles.input}
                  placeholder="Your first name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="nl-email">Email address *</label>
                <input
                  id="nl-email"
                  type="email"
                  required
                  className={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <p className={styles.label}>What would you like to receive?</p>
                <div className={styles.prefGrid}>
                  {PREFERENCES.map((pref) => {
                    const checked = prefs.has(pref.id);
                    return (
                      <label
                        key={pref.id}
                        className={`${styles.prefCard} ${checked ? styles.prefCardChecked : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePref(pref.id)}
                          className={styles.prefCheckbox}
                        />
                        <span className={styles.prefCheck}>{checked ? '✓' : ''}</span>
                        <div>
                          <span className={styles.prefLabel}>{pref.label}</span>
                          <span className={styles.prefDesc}>{pref.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.submitBtn} disabled={loading || !email.trim()}>
                {loading ? 'Subscribing…' : 'Subscribe Now'}
              </button>

              <p className={styles.privacyNote}>
                By subscribing you agree to our{' '}
                <a href="/privacy" className={styles.privacyLink}>Privacy Policy</a>.
                You can unsubscribe at any time.
              </p>
            </form>

            <button
              className={styles.unsubLink}
              onClick={() => setStep('unsubscribe')}
            >
              Want to unsubscribe instead?
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className={styles.successCard}>
            <div className={styles.successIcon}>🎉</div>
            <h2 className={styles.successTitle}>You&apos;re subscribed!</h2>
            <p className={styles.successText}>
              Welcome to the NextCommerce newsletter, {name || 'friend'}! Check your inbox for a confirmation email.
            </p>
            <p className={styles.successSub}>
              You&apos;ll hear from us with updates on{' '}
              {[...prefs].map((p) => PREFERENCES.find((pref) => pref.id === p)?.label).filter(Boolean).join(', ')}.
            </p>
            <div className={styles.successActions}>
              <a href="/products" className={styles.ctaBtn}>Start Shopping</a>
              <a href="/" className={styles.ghostBtn}>Go to Homepage</a>
            </div>
          </div>
        )}

        {step === 'unsubscribe' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Unsubscribe</h2>
            <p className={styles.cardSub}>
              We&apos;re sorry to see you go! Enter your email address to unsubscribe.
            </p>
            <form onSubmit={handleUnsubscribe} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="unsub-email">Email address</label>
                <input
                  id="unsub-email"
                  type="email"
                  required
                  className={styles.input}
                  placeholder="you@example.com"
                  value={unsubEmail}
                  onChange={(e) => setUnsubEmail(e.target.value)}
                />
              </div>
              <button type="submit" className={`${styles.submitBtn} ${styles.submitBtnDanger}`} disabled={loading}>
                {loading ? 'Processing…' : 'Unsubscribe'}
              </button>
            </form>
            <button
              className={styles.unsubLink}
              onClick={() => setStep('form')}
            >
              ← Back to subscribe
            </button>
          </div>
        )}

        {step === 'unsubscribed' && (
          <div className={styles.successCard}>
            <div className={styles.successIcon}>👋</div>
            <h2 className={styles.successTitle}>Successfully unsubscribed</h2>
            <p className={styles.successText}>
              You&apos;ve been removed from our mailing list. We won&apos;t send you any further emails.
            </p>
            <p className={styles.successSub}>
              Changed your mind? You can{' '}
              <button className={styles.resubBtn} onClick={() => { setStep('form'); setUnsubEmail(''); }}>
                subscribe again
              </button>{' '}
              at any time.
            </p>
          </div>
        )}

        {/* Perks */}
        {step === 'form' && (
          <div className={styles.perks}>
            <h3 className={styles.perksTitle}>Why subscribe?</h3>
            <div className={styles.perksGrid}>
              {[
                { icon: '🎟️', title: 'Exclusive Deals', desc: 'Subscriber-only coupon codes and flash sales' },
                { icon: '🚀', title: 'Early Access', desc: 'Shop new releases before anyone else' },
                { icon: '🎁', title: 'Birthday Offer', desc: 'A special gift just for your birthday month' },
                { icon: '📰', title: 'Weekly Digest', desc: 'Curated picks and style inspiration' },
              ].map((perk) => (
                <div key={perk.title} className={styles.perkItem}>
                  <span className={styles.perkIcon}>{perk.icon}</span>
                  <div>
                    <p className={styles.perkTitle}>{perk.title}</p>
                    <p className={styles.perkDesc}>{perk.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
