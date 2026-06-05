import { Metadata } from 'next';
import styles from './faq.module.scss';

export const metadata: Metadata = {
  title: 'FAQ | NextCommerce',
  description: 'Frequently asked questions about orders, shipping, returns, and more.',
};

interface FAQItem {
  question: string;
  answer: string;
}

const SECTIONS: { title: string; icon: string; items: FAQItem[] }[] = [
  {
    title: 'Orders',
    icon: '📦',
    items: [
      {
        question: 'How do I track my order?',
        answer: 'Once your order ships you\'ll receive a confirmation email with a tracking number. You can also use our <a href="/track-order">Order Tracker</a> or log in to view your order status.',
      },
      {
        question: 'Can I modify or cancel my order?',
        answer: 'Orders can be cancelled within 1 hour of placement via your account. After that, the order has been sent to our fulfilment centre and cannot be modified.',
      },
      {
        question: 'What if an item is out of stock after I order?',
        answer: 'We will notify you immediately and issue a full refund for the unavailable item. The rest of your order will ship as normal.',
      },
    ],
  },
  {
    title: 'Shipping',
    icon: '🚚',
    items: [
      {
        question: 'How long does delivery take?',
        answer: 'Standard: 3–7 business days. Express: 2–3 business days. Overnight: Next business day. Free standard shipping on all orders over $75.',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'We currently ship to the US, Canada, UK, Australia, and most EU countries. International orders typically arrive within 7–14 business days.',
      },
      {
        question: 'What are your shipping fees?',
        answer: 'Standard (US): Free on orders $75+, otherwise $6.99. Express: $14.99. Overnight: $24.99. International rates calculated at checkout.',
      },
    ],
  },
  {
    title: 'Returns & Exchanges',
    icon: '↩️',
    items: [
      {
        question: 'What is the return policy?',
        answer: 'Items can be returned within 30 days of delivery if unworn, unwashed, and in original packaging. Sale items are final sale unless defective.',
      },
      {
        question: 'How do I start a return?',
        answer: 'Log in to your account, go to My Orders, and select "Request Return". You\'ll receive a prepaid label within 1 business day.',
      },
      {
        question: 'When will I receive my refund?',
        answer: 'Refunds are processed within 2–3 business days of receiving your return. Allow 5–10 business days for the credit to appear on your statement.',
      },
      {
        question: 'Can I exchange for a different size?',
        answer: 'Yes! Start a return and place a new order for the correct size. We\'ll process both simultaneously to minimize wait time.',
      },
    ],
  },
  {
    title: 'Payments',
    icon: '💳',
    items: [
      {
        question: 'What payment methods are accepted?',
        answer: 'Visa, Mastercard, American Express, Discover, Apple Pay, Google Pay, PayPal, and NextCommerce Gift Cards. You can also use store credit from loyalty points.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely. We use industry-standard SSL encryption and are PCI-DSS compliant. We never store full card numbers on our servers.',
      },
      {
        question: 'How do promo codes work?',
        answer: 'Enter your code at checkout in the "Promo Code" field. Codes cannot be combined unless specified. One code per order.',
      },
    ],
  },
  {
    title: 'Loyalty & Rewards',
    icon: '⭐',
    items: [
      {
        question: 'How do I earn loyalty points?',
        answer: 'Earn 1 point per $1 spent. Bonus points for writing reviews (50 pts), referring friends (500 pts each), and birthday bonuses. Sign up to get 100 welcome points!',
      },
      {
        question: 'How do I redeem my points?',
        answer: '100 points = $1 off. Apply points at checkout by selecting "Use Points". Points cannot be combined with coupon codes.',
      },
      {
        question: 'What are the loyalty tiers?',
        answer: 'Bronze (0+ pts), Silver (500+ pts), Gold (2,000+ pts), Platinum (10,000+ pts). Higher tiers unlock exclusive discounts, early access, and free express shipping.',
      },
    ],
  },
  {
    title: 'Account',
    icon: '👤',
    items: [
      {
        question: 'How do I reset my password?',
        answer: 'On the login page, click "Forgot Password" and enter your email. You\'ll receive a reset link within 5 minutes.',
      },
      {
        question: 'How do I delete my account?',
        answer: 'Contact our support team at support@nextcommerce.io to request account deletion. Data will be removed within 30 days per our privacy policy.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Frequently Asked Questions</h1>
        <p className={styles.sub}>
          Find answers to the most common questions below. Can't find what you're looking for?{' '}
          <a href="mailto:support@nextcommerce.io" className={styles.contactLink}>
            Contact us
          </a>
          .
        </p>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.title} className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {section.icon} {section.title}
          </h2>
          <div className={styles.items}>
            {section.items.map((item) => (
              <details key={item.question} className={styles.item}>
                <summary className={styles.question}>{item.question}</summary>
                <p
                  className={styles.answer}
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </details>
            ))}
          </div>
        </section>
      ))}

      <div className={styles.cta}>
        <h2 className={styles.ctaTitle}>Still have questions?</h2>
        <p className={styles.ctaSub}>Our support team is here to help.</p>
        <div className={styles.ctaActions}>
          <a href="mailto:support@nextcommerce.io" className="btn btn--primary">
            📧 Email Support
          </a>
          <a href="/track-order" className="btn btn--outline">
            📦 Track an Order
          </a>
        </div>
      </div>
    </main>
  );
}
