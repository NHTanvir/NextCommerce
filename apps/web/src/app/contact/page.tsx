'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './contact.module.scss';

const TOPICS = [
  { value: 'order', label: '📦 Order Issue' },
  { value: 'return', label: '↩️ Return or Refund' },
  { value: 'product', label: '👟 Product Question' },
  { value: 'account', label: '👤 Account Help' },
  { value: 'payment', label: '💳 Payment Problem' },
  { value: 'other', label: '💬 Other' },
];

const QUICK_LINKS = [
  { href: '/track-order', icon: '📍', label: 'Track Your Order', desc: 'Get real-time shipping status' },
  { href: '/faq', icon: '❓', label: 'FAQ', desc: 'Answers to common questions' },
  { href: '/account/returns', icon: '↩️', label: 'Start a Return', desc: 'Return or exchange in 30 days' },
  { href: '/account/orders', icon: '📦', label: 'Order History', desc: 'View all your orders' },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    orderNumber: '',
    topic: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message || !form.topic) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setSubmitting(false);
  };

  const valid = form.name && form.email && form.message && form.topic;

  if (submitted) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.successCard}>
          <span className={styles.successIcon}>✅</span>
          <h1 className={styles.successTitle}>Message Sent!</h1>
          <p className={styles.successSub}>
            Thanks for reaching out, {form.name.split(' ')[0]}. We&apos;ll reply to <strong>{form.email}</strong> within
            24 hours.
          </p>
          <div className={styles.successActions}>
            <Link href="/" className="btn btn-primary">Back to Home</Link>
            <button className={styles.anotherBtn} onClick={() => { setSubmitted(false); setForm({ name: '', email: '', orderNumber: '', topic: '', message: '' }); }}>
              Send Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Get in Touch</h1>
        <p className={styles.sub}>
          Our support team is available Monday–Friday, 9am–6pm EST. We typically reply within 24 hours.
        </p>
      </div>

      <div className={styles.layout}>
        {/* Form */}
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="contact-name">Your Name</label>
                <input
                  id="contact-name"
                  type="text"
                  className={styles.input}
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  className={styles.input}
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="contact-topic">Topic</label>
              <select
                id="contact-topic"
                className={styles.select}
                value={form.topic}
                onChange={(e) => handleChange('topic', e.target.value)}
                required
              >
                <option value="">Choose a topic…</option>
                {TOPICS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="contact-order">
                Order Number <span className={styles.optional}>(optional)</span>
              </label>
              <input
                id="contact-order"
                type="text"
                className={styles.input}
                placeholder="e.g. #A3F2B9C1"
                value={form.orderNumber}
                onChange={(e) => handleChange('orderNumber', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Describe your issue or question in detail…"
                rows={5}
                value={form.message}
                onChange={(e) => handleChange('message', e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={!valid || submitting}
            >
              {submitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sideSection}>
            <h2 className={styles.sideTitle}>Quick Help</h2>
            <div className={styles.quickLinks}>
              {QUICK_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={styles.quickLink}>
                  <span className={styles.quickIcon}>{l.icon}</span>
                  <span>
                    <span className={styles.quickLabel}>{l.label}</span>
                    <span className={styles.quickDesc}>{l.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.sideSection}>
            <h2 className={styles.sideTitle}>Contact Info</h2>
            <div className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <span>📧</span>
                <div>
                  <p className={styles.contactItemLabel}>Customer Support</p>
                  <a href="mailto:support@nextcommerce.io" className={styles.contactItemValue}>
                    support@nextcommerce.io
                  </a>
                </div>
              </div>
              <div className={styles.contactItem}>
                <span>⚖️</span>
                <div>
                  <p className={styles.contactItemLabel}>Legal</p>
                  <a href="mailto:legal@nextcommerce.io" className={styles.contactItemValue}>
                    legal@nextcommerce.io
                  </a>
                </div>
              </div>
              <div className={styles.contactItem}>
                <span>🏢</span>
                <div>
                  <p className={styles.contactItemLabel}>Office</p>
                  <p className={styles.contactItemValue}>350 5th Ave, New York, NY 10118</p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <span>🕐</span>
                <div>
                  <p className={styles.contactItemLabel}>Support Hours</p>
                  <p className={styles.contactItemValue}>Mon–Fri, 9am–6pm EST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
