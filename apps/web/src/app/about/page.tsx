import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './about.module.scss';

export const metadata: Metadata = {
  title: 'About Us | NextCommerce',
  description: 'Learn about NextCommerce — our story, mission, and the team behind the platform.',
};

const STATS = [
  { value: '2M+', label: 'Happy Customers' },
  { value: '150K+', label: 'Products Listed' },
  { value: '99.7%', label: 'Uptime SLA' },
  { value: '48h', label: 'Avg Delivery' },
];

const VALUES = [
  {
    icon: '🎯',
    title: 'Customer First',
    body: 'Every product decision, every policy, every line of code starts with one question: does this make things better for our customers?',
  },
  {
    icon: '🔒',
    title: 'Trust & Safety',
    body: 'We verify every seller, encrypt all transactions, and back every purchase with our buyer protection guarantee.',
  },
  {
    icon: '⚡',
    title: 'Speed Matters',
    body: 'From page load times to delivery windows, we obsess over reducing wait. Your time is valuable.',
  },
  {
    icon: '🌱',
    title: 'Sustainability',
    body: 'We offset 100% of shipping emissions and partner with brands that share our commitment to the planet.',
  },
];

const TEAM = [
  { name: 'Aria Chen', role: 'Co-Founder & CEO', initials: 'AC', color: '#e94560' },
  { name: 'Marcus Webb', role: 'Co-Founder & CTO', initials: 'MW', color: '#58a6ff' },
  { name: 'Sofia Reyes', role: 'Head of Product', initials: 'SR', color: '#3fb950' },
  { name: 'Devon Park', role: 'VP Engineering', initials: 'DP', color: '#8957e5' },
  { name: 'Zara Okonkwo', role: 'Head of Design', initials: 'ZO', color: '#f59e0b' },
  { name: 'James Liu', role: 'Head of Operations', initials: 'JL', color: '#06b6d4' },
];

const MILESTONES = [
  { year: '2020', event: 'NextCommerce founded in New York with a team of 4' },
  { year: '2021', event: 'Launched beta with 500 products and 10K early adopters' },
  { year: '2022', event: 'Series A funding — expanded to 50+ employees and 100K products' },
  { year: '2023', event: 'Reached 1M customers; launched mobile app for iOS and Android' },
  { year: '2024', event: 'Introduced AI-powered recommendations and same-day delivery in 12 cities' },
  { year: '2025', event: 'Surpassed 2M customers; launched seller marketplace and loyalty program' },
];

export default function AboutPage() {
  return (
    <main className={`container ${styles.page}`}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>Our Story</div>
        <h1 className={styles.heroTitle}>
          Commerce built for<br />
          <span className={styles.accent}>real people</span>
        </h1>
        <p className={styles.heroSub}>
          NextCommerce started with a simple belief: shopping online should feel as good as the best
          retail experience — fast, personal, and trustworthy. We&apos;re still building toward that vision
          every day.
        </p>
      </section>

      {/* Stats */}
      <section className={styles.statsRow}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.statItem}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* Mission */}
      <section className={styles.mission}>
        <div className={styles.missionText}>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
          <p>
            We believe great products should be discoverable by anyone, not just those who know where to look.
            NextCommerce connects shoppers with the best footwear, apparel, and lifestyle brands — through
            a platform that&apos;s fast, fair, and built on trust.
          </p>
          <p>
            We&apos;re not just a marketplace. We hand-curate every brand on our platform, test fulfilment
            partners against strict SLAs, and stand behind every order with our buyer protection guarantee.
          </p>
        </div>
        <div className={styles.missionQuote}>
          <blockquote className={styles.quote}>
            &ldquo;We didn&apos;t build another checkout button. We built the infrastructure for
            trust between brands and the people who love them.&rdquo;
          </blockquote>
          <cite className={styles.quoteAuthor}>— Aria Chen, CEO</cite>
        </div>
      </section>

      {/* Values */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What We Stand For</h2>
        <div className={styles.valuesGrid}>
          {VALUES.map((v) => (
            <div key={v.title} className={styles.valueCard}>
              <span className={styles.valueIcon}>{v.icon}</span>
              <h3 className={styles.valueTitle}>{v.title}</h3>
              <p className={styles.valueBody}>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Our Journey</h2>
        <div className={styles.timeline}>
          {MILESTONES.map((m) => (
            <div key={m.year} className={styles.timelineItem}>
              <div className={styles.timelineYear}>{m.year}</div>
              <div className={styles.timelineDot} />
              <div className={styles.timelineEvent}>{m.event}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Meet the Team</h2>
        <p className={styles.sectionSub}>
          A diverse group of engineers, designers, and operators united by a shared obsession with
          great commerce.
        </p>
        <div className={styles.teamGrid}>
          {TEAM.map((member) => (
            <div key={member.name} className={styles.teamCard}>
              <div
                className={styles.teamAvatar}
                style={{ background: `${member.color}22`, border: `2px solid ${member.color}` }}
              >
                <span style={{ color: member.color }}>{member.initials}</span>
              </div>
              <p className={styles.teamName}>{member.name}</p>
              <p className={styles.teamRole}>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Join the NextCommerce community</h2>
        <p className={styles.ctaSub}>
          Millions of shoppers trust us every month. Start exploring today.
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/products" className="btn btn-primary">Shop Now</Link>
          <Link href="/careers" className={styles.ctaSecondary}>We&apos;re Hiring →</Link>
        </div>
      </section>
    </main>
  );
}
