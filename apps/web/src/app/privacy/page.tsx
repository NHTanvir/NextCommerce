import { Metadata } from 'next';
import styles from './privacy.module.scss';

export const metadata: Metadata = {
  title: 'Privacy Policy | NextCommerce',
  description: 'How NextCommerce collects, uses, and protects your personal information.',
};

const LAST_UPDATED = 'January 15, 2025';

export default function PrivacyPage() {
  return (
    <main className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.meta}>Last updated: {LAST_UPDATED}</p>
      </div>

      <div className={styles.toc}>
        <h2 className={styles.tocTitle}>Contents</h2>
        <ol className={styles.tocList}>
          {[
            'Information We Collect',
            'How We Use Your Information',
            'Sharing Your Information',
            'Cookies and Tracking',
            'Data Security',
            'Your Rights',
            'Children\'s Privacy',
            'Changes to This Policy',
            'Contact Us',
          ].map((item, i) => (
            <li key={i}>
              <a href={`#section-${i + 1}`} className={styles.tocLink}>{item}</a>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.body}>
        <p className={styles.intro}>
          At NextCommerce, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase. Please read this policy carefully.
        </p>

        <section id="section-1" className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Information We Collect</h2>
          <h3 className={styles.h3}>Personal Information You Provide</h3>
          <ul>
            <li>Name, email address, phone number</li>
            <li>Billing and shipping addresses</li>
            <li>Payment information (we do not store card numbers)</li>
            <li>Account login credentials (passwords are hashed)</li>
            <li>Order history and preferences</li>
            <li>Communications with our support team</li>
          </ul>
          <h3 className={styles.h3}>Information Collected Automatically</h3>
          <ul>
            <li>IP address, browser type, device information</li>
            <li>Pages visited, time spent, referral sources</li>
            <li>Cookie data and session identifiers</li>
            <li>Purchase and browse history</li>
          </ul>
        </section>

        <section id="section-2" className={styles.section}>
          <h2 className={styles.sectionTitle}>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and fulfil your orders</li>
            <li>Send order confirmations, shipping updates, and receipts</li>
            <li>Manage your account and loyalty rewards</li>
            <li>Personalise product recommendations</li>
            <li>Send promotional emails (you can opt out at any time)</li>
            <li>Improve our website, services, and product offerings</li>
            <li>Detect and prevent fraud or unauthorised access</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section id="section-3" className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Sharing Your Information</h2>
          <p>We do not sell your personal data. We may share it with:</p>
          <ul>
            <li><strong>Service providers</strong> — payment processors (Stripe), shipping carriers (FedEx, UPS, USPS), email platforms, and analytics providers under strict data processing agreements.</li>
            <li><strong>Legal authorities</strong> — when required by law, subpoena, or to protect our rights.</li>
            <li><strong>Business transfers</strong> — in the event of a merger, acquisition, or sale of assets, customer data may be transferred as a business asset.</li>
          </ul>
        </section>

        <section id="section-4" className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Cookies and Tracking</h2>
          <p>We use cookies and similar tracking technologies to enhance your experience:</p>
          <ul>
            <li><strong>Essential cookies</strong> — required for the site to function (cart, session)</li>
            <li><strong>Analytics cookies</strong> — help us understand how visitors interact with the site</li>
            <li><strong>Marketing cookies</strong> — used for targeted advertising (can be disabled)</li>
          </ul>
          <p>You can control cookie preferences through your browser settings or our cookie consent banner.</p>
        </section>

        <section id="section-5" className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Data Security</h2>
          <p>We implement industry-standard security measures including SSL/TLS encryption, two-factor authentication options, regular security audits, and PCI-DSS compliance for payment processing. However, no method of transmission over the internet is 100% secure.</p>
        </section>

        <section id="section-6" className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data ("right to be forgotten")</li>
            <li>Opt out of marketing communications</li>
            <li>Data portability (receive your data in a machine-readable format)</li>
            <li>Lodge a complaint with your local data protection authority</li>
          </ul>
          <p>To exercise these rights, email us at <a href="mailto:privacy@nextcommerce.io" className={styles.link}>privacy@nextcommerce.io</a>.</p>
        </section>

        <section id="section-7" className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Children's Privacy</h2>
          <p>Our services are not directed to children under 13. We do not knowingly collect personal information from children. If you believe we have collected data from a child, contact us immediately.</p>
        </section>

        <section id="section-8" className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or a prominent notice on our website. Continued use of our services after changes constitutes acceptance.</p>
        </section>

        <section id="section-9" className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, contact our Privacy Team:</p>
          <div className={styles.contactBox}>
            <p><strong>Email:</strong> <a href="mailto:privacy@nextcommerce.io" className={styles.link}>privacy@nextcommerce.io</a></p>
            <p><strong>Mail:</strong> NextCommerce Inc., 350 5th Ave, New York, NY 10118</p>
          </div>
        </section>
      </div>
    </main>
  );
}
