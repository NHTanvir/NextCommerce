import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './careers.module.scss';

export const metadata: Metadata = {
  title: 'Careers | NextCommerce',
  description: 'Join the NextCommerce team. We\'re hiring engineers, designers, and operators who love great commerce.',
};

const PERKS = [
  { icon: '🌍', title: 'Remote-First', body: 'Work from anywhere. We have team members in 14 countries and async-friendly processes.' },
  { icon: '🏖️', title: 'Unlimited PTO', body: 'Take what you need. We trust you. Most teammates take 3–5 weeks per year.' },
  { icon: '📚', title: '$2K Learning Budget', body: 'Courses, conferences, books, certifications — spend it on whatever sharpens your skills.' },
  { icon: '🏥', title: 'Full Health Coverage', body: 'Medical, dental, and vision for you and your family, covered at 100% for US employees.' },
  { icon: '💻', title: 'Top-Tier Equipment', body: 'MacBook Pro M4, 4K monitor, mechanical keyboard — whatever setup makes you most effective.' },
  { icon: '📈', title: 'Equity for Everyone', body: 'Every employee receives a meaningful equity grant. We grow together.' },
];

interface JobListing {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
}

const OPEN_ROLES: JobListing[] = [
  { id: 'sre-001', title: 'Senior Site Reliability Engineer', team: 'Infrastructure', location: 'Remote (US/EU)', type: 'Full-time' },
  { id: 'be-002', title: 'Backend Engineer — Payments', team: 'Engineering', location: 'Remote', type: 'Full-time' },
  { id: 'fe-003', title: 'Frontend Engineer — Web', team: 'Engineering', location: 'Remote', type: 'Full-time' },
  { id: 'ml-004', title: 'ML Engineer — Recommendations', team: 'Data & ML', location: 'Remote (US)', type: 'Full-time' },
  { id: 'ds-005', title: 'Product Designer', team: 'Design', location: 'Remote', type: 'Full-time' },
  { id: 'pm-006', title: 'Senior Product Manager — Growth', team: 'Product', location: 'New York, NY', type: 'Full-time' },
  { id: 'cs-007', title: 'Customer Success Manager', team: 'Operations', location: 'Remote (US)', type: 'Full-time' },
  { id: 'da-008', title: 'Data Analyst — Commerce', team: 'Data & ML', location: 'Remote', type: 'Full-time' },
];

const TEAMS = [...new Set(OPEN_ROLES.map((r) => r.team))];

const TEAM_COLORS: Record<string, string> = {
  Engineering: '#58a6ff',
  Infrastructure: '#3fb950',
  'Data & ML': '#8957e5',
  Design: '#e94560',
  Product: '#f59e0b',
  Operations: '#06b6d4',
};

const PROCESS = [
  { step: '01', title: 'Application Review', body: 'We read every application. Expect to hear back within 5 business days.' },
  { step: '02', title: 'Recruiter Screen', body: '30 minutes with our talent team to learn about you and your background.' },
  { step: '03', title: 'Technical / Skills Round', body: 'A focused assessment relevant to the role — no whiteboard puzzles.' },
  { step: '04', title: 'Team Interviews', body: 'Meet 3–4 teammates across 2–3 sessions over a week. No surprises.' },
  { step: '05', title: 'Offer', body: 'We move fast. Decisions within 48h of final interviews.' },
];

export default function CareersPage() {
  return (
    <main className={`container ${styles.page}`}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>We&apos;re Hiring</div>
        <h1 className={styles.heroTitle}>Build the future of commerce</h1>
        <p className={styles.heroSub}>
          We&apos;re a fast-moving team of ~120 people solving hard problems at the intersection of
          technology, logistics, and consumer experience. Come build with us.
        </p>
        <div className={styles.heroStats}>
          <span>120+ employees</span>
          <span className={styles.dot}>·</span>
          <span>14 countries</span>
          <span className={styles.dot}>·</span>
          <span>Series B</span>
          <span className={styles.dot}>·</span>
          <span>{OPEN_ROLES.length} open roles</span>
        </div>
      </section>

      {/* Perks */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why NextCommerce</h2>
        <div className={styles.perksGrid}>
          {PERKS.map((p) => (
            <div key={p.title} className={styles.perkCard}>
              <span className={styles.perkIcon}>{p.icon}</span>
              <h3 className={styles.perkTitle}>{p.title}</h3>
              <p className={styles.perkBody}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open Roles */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Open Roles</h2>
        <div className={styles.teamGroups}>
          {TEAMS.map((team) => {
            const roles = OPEN_ROLES.filter((r) => r.team === team);
            return (
              <div key={team} className={styles.teamGroup}>
                <h3
                  className={styles.teamLabel}
                  style={{ color: TEAM_COLORS[team] ?? '#8b949e' }}
                >
                  {team}
                </h3>
                <div className={styles.roleList}>
                  {roles.map((role) => (
                    <div key={role.id} className={styles.roleCard}>
                      <div className={styles.roleInfo}>
                        <p className={styles.roleTitle}>{role.title}</p>
                        <p className={styles.roleMeta}>
                          <span>{role.location}</span>
                          <span className={styles.dot}>·</span>
                          <span>{role.type}</span>
                        </p>
                      </div>
                      <Link
                        href={`/careers/${role.id}`}
                        className={styles.applyBtn}
                      >
                        Apply
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Process */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Our Hiring Process</h2>
        <p className={styles.sectionSub}>
          Transparent, fast, and respectful of your time. Here&apos;s what to expect.
        </p>
        <div className={styles.processList}>
          {PROCESS.map((item) => (
            <div key={item.step} className={styles.processItem}>
              <div className={styles.processStep}>{item.step}</div>
              <div className={styles.processBody}>
                <h3 className={styles.processTitle}>{item.title}</h3>
                <p className={styles.processDesc}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Don&apos;t see a match?</h2>
        <p className={styles.ctaSub}>
          We&apos;re always interested in talented people. Send us your CV and a note about what
          you&apos;re looking for.
        </p>
        <a href="mailto:careers@nextcommerce.io" className="btn btn-primary">
          Get in Touch
        </a>
      </section>
    </main>
  );
}
