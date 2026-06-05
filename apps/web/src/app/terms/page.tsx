import { Metadata } from 'next';
import styles from './terms.module.scss';

export const metadata: Metadata = {
  title: 'Terms of Service | NextCommerce',
  description: 'Terms and conditions for using NextCommerce services.',
};

const LAST_UPDATED = 'January 15, 2025';

export default function TermsPage() {
  return (
    <main className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.meta}>Last updated: {LAST_UPDATED}</p>
      </div>

      <div className={styles.body}>
        <p className={styles.intro}>
          By accessing or using NextCommerce's website, mobile application, or services, you agree to be bound by these Terms of Service. If you disagree with any part, please do not use our services.
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Use of Services</h2>
          <p>You must be at least 16 years old to use our services. By creating an account, you warrant that you are at least 16 years of age and have the legal authority to enter into this agreement.</p>
          <p>You agree not to:</p>
          <ul>
            <li>Use our services for any unlawful purpose</li>
            <li>Attempt to circumvent any security measures</li>
            <li>Submit false or misleading information</li>
            <li>Use automated tools to scrape or abuse our services</li>
            <li>Resell products purchased through our platform without written permission</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Account Responsibility</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility. Notify us immediately at <a href="mailto:support@nextcommerce.io" className={styles.link}>support@nextcommerce.io</a> if you suspect unauthorized access.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Orders and Payments</h2>
          <p>All prices are in USD and are subject to change without notice. We reserve the right to refuse or cancel orders at our discretion, including due to pricing errors or suspected fraud. Payment is charged at the time of shipment.</p>
          <p>By placing an order, you represent that the payment information provided is accurate and that you are authorized to use the payment method.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Intellectual Property</h2>
          <p>All content on this platform — including text, images, logos, product descriptions, and software — is the property of NextCommerce or its licensors and is protected by copyright law. You may not reproduce, distribute, or create derivative works without written permission.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Product Information</h2>
          <p>We strive for accuracy in product descriptions, images, and pricing. However, we do not warrant that product information is error-free. In the event of a pricing error, we will contact you before processing.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, NextCommerce shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services, even if we have been advised of the possibility of such damages.</p>
          <p>Our maximum aggregate liability for any claims arising from these Terms shall not exceed the amount you paid for the specific product or service giving rise to the claim.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Governing Law</h2>
          <p>These Terms are governed by the laws of the State of New York, without regard to conflict of law principles. Any disputes shall be resolved in the courts of New York County, New York.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Changes to Terms</h2>
          <p>We may modify these Terms at any time. Continued use of our services after changes constitutes acceptance. We will notify registered users of material changes via email.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Contact</h2>
          <p>Questions about these Terms? Contact us at <a href="mailto:legal@nextcommerce.io" className={styles.link}>legal@nextcommerce.io</a>.</p>
        </section>
      </div>
    </main>
  );
}
