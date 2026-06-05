import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './press.module.scss';

export const metadata: Metadata = {
  title: 'Press & Media | NextCommerce',
  description: 'Press resources, media kit, and recent coverage about NextCommerce.',
};

const PRESS_FEATURES = [
  {
    outlet: 'TechCrunch',
    title: 'NextCommerce raises $40M Series B to power the next generation of digital-native retail',
    date: 'March 2025',
    url: '#',
    category: 'Funding',
  },
  {
    outlet: 'Forbes',
    title: 'The Sneaker Startup That\'s Rewriting the Rules of Online Commerce',
    date: 'January 2025',
    url: '#',
    category: 'Feature',
  },
  {
    outlet: 'The Verge',
    title: 'NextCommerce\'s new AI recommendation engine knows what you want before you do',
    date: 'November 2024',
    url: '#',
    category: 'Product',
  },
  {
    outlet: 'Fast Company',
    title: 'How NextCommerce is solving the last-mile problem for premium footwear',
    date: 'October 2024',
    url: '#',
    category: 'Operations',
  },
  {
    outlet: 'Business Insider',
    title: 'NextCommerce hits 1 million customers: The startup that\'s winning on trust',
    date: 'August 2024',
    url: '#',
    category: 'Milestone',
  },
  {
    outlet: 'Retail Dive',
    title: 'Customer loyalty programs still work — NextCommerce\'s data proves it',
    date: 'June 2024',
    url: '#',
    category: 'Research',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Funding: '#58a6ff',
  Feature: '#e94560',
  Product: '#8957e5',
  Operations: '#f59e0b',
  Milestone: '#3fb950',
  Research: '#06b6d4',
};

const AWARDS = [
  { icon: '🏆', title: 'Best E-Commerce Platform 2024', org: 'Retail Technology Awards' },
  { icon: '⭐', title: 'Top 50 Startups to Watch', org: 'Forbes — 2024' },
  { icon: '🚀', title: 'Fastest Growing E-Commerce Company', org: 'Inc. 5000 — 2023' },
  { icon: '💡', title: 'Innovation in Retail Tech', org: 'NRF Big Show — 2024' },
];

export default function PressPage() {
  return (
    <main className={`container ${styles.page}`}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>Press & Media</div>
        <h1 className={styles.title}>In the News</h1>
        <p className={styles.sub}>
          Coverage, announcements, and resources for journalists and media professionals.
        </p>
      </section>

      {/* Press coverage */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Coverage</h2>
        <div className={styles.pressGrid}>
          {PRESS_FEATURES.map((item) => (
            <a key={item.title} href={item.url} className={styles.pressCard} target="_blank" rel="noopener noreferrer">
              <div className={styles.pressCardTop}>
                <span
                  className={styles.pressBadge}
                  style={{
                    background: `${CATEGORY_COLORS[item.category] ?? '#8b949e'}15`,
                    color: CATEGORY_COLORS[item.category] ?? '#8b949e',
                    borderColor: `${CATEGORY_COLORS[item.category] ?? '#8b949e'}40`,
                  }}
                >
                  {item.category}
                </span>
                <span className={styles.pressDate}>{item.date}</span>
              </div>
              <p className={styles.pressOutlet}>{item.outlet}</p>
              <h3 className={styles.pressTitle}>{item.title}</h3>
              <span className={styles.pressRead}>Read story →</span>
            </a>
          ))}
        </div>
      </section>

      {/* Awards */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Awards & Recognition</h2>
        <div className={styles.awardsGrid}>
          {AWARDS.map((award) => (
            <div key={award.title} className={styles.awardCard}>
              <span className={styles.awardIcon}>{award.icon}</span>
              <div>
                <p className={styles.awardTitle}>{award.title}</p>
                <p className={styles.awardOrg}>{award.org}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Media Kit */}
      <section className={styles.kitSection}>
        <div className={styles.kitContent}>
          <h2 className={styles.kitTitle}>Media Kit</h2>
          <p className={styles.kitSub}>
            Download our official brand assets, executive headshots, product screenshots,
            and company fact sheet.
          </p>
          <div className={styles.kitItems}>
            <div className={styles.kitItem}>
              <span className={styles.kitItemIcon}>🖼️</span>
              <div>
                <p className={styles.kitItemLabel}>Logo Pack</p>
                <p className={styles.kitItemDesc}>SVG + PNG, dark and light variants</p>
              </div>
              <a href="#" className={styles.downloadBtn}>Download</a>
            </div>
            <div className={styles.kitItem}>
              <span className={styles.kitItemIcon}>📸</span>
              <div>
                <p className={styles.kitItemLabel}>Press Photos</p>
                <p className={styles.kitItemDesc}>Team headshots, office, product images</p>
              </div>
              <a href="#" className={styles.downloadBtn}>Download</a>
            </div>
            <div className={styles.kitItem}>
              <span className={styles.kitItemIcon}>📄</span>
              <div>
                <p className={styles.kitItemLabel}>Fact Sheet</p>
                <p className={styles.kitItemDesc}>Company overview, key stats, milestones</p>
              </div>
              <a href="#" className={styles.downloadBtn}>Download</a>
            </div>
          </div>
        </div>
      </section>

      {/* Press contact */}
      <section className={styles.contactSection}>
        <h2 className={styles.contactTitle}>Press Inquiries</h2>
        <p className={styles.contactSub}>
          For media requests, interview inquiries, and fact-checking, please contact our communications team.
        </p>
        <div className={styles.contactCards}>
          <div className={styles.contactCard}>
            <p className={styles.contactCardLabel}>Media Contact</p>
            <a href="mailto:press@nextcommerce.io" className={styles.contactCardEmail}>
              press@nextcommerce.io
            </a>
          </div>
          <div className={styles.contactCard}>
            <p className={styles.contactCardLabel}>Response Time</p>
            <p className={styles.contactCardValue}>Within 24 hours, Mon–Fri</p>
          </div>
        </div>
        <Link href="/about" className={styles.aboutLink}>← Read our story</Link>
      </section>
    </main>
  );
}
