import { Metadata } from 'next';
import Link from 'next/link';
import styles from './terms.module.scss';

export const metadata: Metadata = {
  title: 'Terms of Service | NextCommerce',
  description: 'Terms and conditions for using NextCommerce services, purchasing products, and accessing your account.',
};

const LAST_UPDATED = 'January 15, 2025';

const TOC = [
  { id: 'eligibility', label: '1. Eligibility and Account' },
  { id: 'use', label: '2. Use of Services' },
  { id: 'orders', label: '3. Orders and Payments' },
  { id: 'shipping', label: '4. Shipping and Delivery' },
  { id: 'returns', label: '5. Returns and Refunds' },
  { id: 'ip', label: '6. Intellectual Property' },
  { id: 'content', label: '7. User Content' },
  { id: 'privacy', label: '8. Privacy' },
  { id: 'liability', label: '9. Limitation of Liability' },
  { id: 'dispute', label: '10. Dispute Resolution' },
  { id: 'changes', label: '11. Changes to Terms' },
  { id: 'contact', label: '12. Contact' },
];

export default function TermsPage() {
  return (
    <main className={`container ${styles.page}`}>
      <div className={styles.header}>
        <span className={styles.badge}>Legal</span>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.meta}>
          Last updated: {LAST_UPDATED} ·{' '}
          <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
        </p>
        <p className={styles.intro}>
          Welcome to NextCommerce. By accessing or using our website, mobile app, or any related services, you agree to be bound by these Terms. Please read them carefully before making any purchase or creating an account.
        </p>
      </div>

      <div className={styles.layout}>
        {/* Table of contents */}
        <aside className={styles.toc}>
          <p className={styles.tocTitle}>On this page</p>
          <nav>
            {TOC.map((item) => (
              <a key={item.id} href={`#${item.id}`} className={styles.tocLink}>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className={styles.body}>
          <section id="eligibility" className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Eligibility and Account</h2>
            <p>You must be at least 16 years old to create an account or make purchases. By using NextCommerce, you confirm you meet this requirement and have legal capacity to enter into contracts in your jurisdiction.</p>
            <p>You are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately at <a href="mailto:support@nextcommerce.io" className={styles.link}>support@nextcommerce.io</a> if you suspect unauthorized access</li>
              <li>Providing accurate and current information in your profile</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms or are involved in fraudulent activity.</p>
          </section>

          <section id="use" className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Use of Services</h2>
            <p>NextCommerce grants you a limited, non-exclusive, non-transferable right to use our services for personal, non-commercial purposes. You agree not to:</p>
            <ul>
              <li>Use our services for any unlawful, harmful, or fraudulent purpose</li>
              <li>Attempt to circumvent any security, authentication, or access controls</li>
              <li>Submit false, misleading, or defamatory information or reviews</li>
              <li>Use automated tools, bots, or scripts to access or scrape our platform</li>
              <li>Resell, sublicense, or commercially exploit products or our platform without written permission</li>
              <li>Interfere with or disrupt the integrity or performance of our services</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
            </ul>
          </section>

          <section id="orders" className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Orders and Payments</h2>
            <p>All prices are listed in USD and are subject to change. Placing an order constitutes an offer to purchase at the listed price. We reserve the right to accept or decline any order.</p>
            <p><strong>Payment:</strong> We accept major credit cards, debit cards, and supported digital payment methods. By submitting payment information, you represent that you are authorized to use the payment method provided and that the information is accurate.</p>
            <p><strong>Pricing errors:</strong> In the case of a pricing error, we will contact you prior to fulfillment to offer the corrected price or a cancellation.</p>
            <p><strong>Taxes:</strong> Applicable sales tax will be calculated and displayed at checkout based on your shipping address.</p>
            <p><strong>Gift cards:</strong> Gift cards are non-refundable and cannot be exchanged for cash. Lost or stolen gift cards cannot be replaced unless required by law.</p>
          </section>

          <section id="shipping" className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Shipping and Delivery</h2>
            <p>Estimated delivery dates are provided at checkout and are not guaranteed. Title and risk of loss transfer to you upon delivery to the carrier. We are not responsible for delays caused by carriers, customs, weather, or other factors outside our control.</p>
            <p>Free shipping thresholds are applied per order before discounts and after taxes. Offer availability may vary by location and product type.</p>
          </section>

          <section id="returns" className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Returns and Refunds</h2>
            <p>We offer a <strong>30-day return window</strong> for unworn, unused items in original packaging with tags attached. Sale items may be subject to different return policies as noted at the time of purchase.</p>
            <p>To initiate a return, visit your account's <Link href="/account/returns" className={styles.link}>Returns page</Link>. Refunds are processed within 5–10 business days after we receive the returned item. Original shipping costs are non-refundable unless the return is due to our error.</p>
          </section>

          <section id="ip" className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Intellectual Property</h2>
            <p>All content on this platform — including text, images, logos, product descriptions, UI elements, and source code — is the property of NextCommerce or its licensors. Nothing in these Terms grants you any right to use our trademarks, logos, or brand features without prior written consent.</p>
            <p>Product trademarks (Nike, Adidas, etc.) are the property of their respective owners.</p>
          </section>

          <section id="content" className={styles.section}>
            <h2 className={styles.sectionTitle}>7. User Content</h2>
            <p>By submitting reviews, Q&A responses, or other content ("User Content"), you grant NextCommerce a worldwide, royalty-free, perpetual license to use, reproduce, modify, and display that content in connection with our services.</p>
            <p>You are solely responsible for your User Content. You must not submit content that is defamatory, obscene, infringing, or in violation of any third-party rights. We reserve the right to remove User Content at our discretion.</p>
          </section>

          <section id="privacy" className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Privacy</h2>
            <p>Your use of our services is also governed by our <Link href="/privacy" className={styles.link}>Privacy Policy</Link>, which is incorporated into these Terms. By using our services, you consent to the collection and use of your data as described therein.</p>
          </section>

          <section id="liability" className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NEXTCOMMERCE AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL.</p>
            <p>Our aggregate liability for any claims arising under these Terms shall not exceed the greater of (a) $100 or (b) the total amount you paid NextCommerce in the twelve months preceding the claim.</p>
            <p>Some jurisdictions do not allow exclusion of certain warranties or limitation of liability, so some of the above may not apply to you.</p>
          </section>

          <section id="dispute" className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Dispute Resolution</h2>
            <p>We prefer to resolve disputes informally. Please contact us at <a href="mailto:legal@nextcommerce.io" className={styles.link}>legal@nextcommerce.io</a> before initiating formal proceedings.</p>
            <p>These Terms are governed by the laws of the State of New York. Any dispute not resolved informally within 30 days shall be submitted to binding arbitration under the AAA Commercial Arbitration Rules, except that either party may seek injunctive relief in a court of competent jurisdiction.</p>
            <p><strong>Class action waiver:</strong> You agree to resolve disputes only on an individual basis and not as part of a class, consolidated, or representative action.</p>
          </section>

          <section id="changes" className={styles.section}>
            <h2 className={styles.sectionTitle}>11. Changes to Terms</h2>
            <p>We may update these Terms periodically. We will post the revised Terms with an updated "Last Updated" date. For material changes, we will notify registered users via email at least 14 days in advance. Continued use of our services after the effective date constitutes acceptance of the revised Terms.</p>
          </section>

          <section id="contact" className={styles.section}>
            <h2 className={styles.sectionTitle}>12. Contact</h2>
            <p>Questions about these Terms? Contact us:</p>
            <ul>
              <li>Email: <a href="mailto:legal@nextcommerce.io" className={styles.link}>legal@nextcommerce.io</a></li>
              <li>Support: <Link href="/contact" className={styles.link}>Contact Us</Link></li>
              <li>Mail: NextCommerce Legal, 350 Fifth Avenue, New York, NY 10118</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
