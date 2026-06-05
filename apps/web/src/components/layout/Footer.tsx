import Link from 'next/link';
import { NewsletterSignup } from '../features/NewsletterSignup';
import styles from './Footer.module.scss';

const FOOTER_LINKS = {
  Shop: [
    { href: '/products', label: 'All Products' },
    { href: '/products?category=running', label: 'Running' },
    { href: '/products?category=lifestyle', label: 'Lifestyle' },
    { href: '/products?category=basketball', label: 'Basketball' },
    { href: '/products?category=trail', label: 'Trail' },
  ],
  Account: [
    { href: '/auth/login', label: 'Sign In' },
    { href: '/auth/register', label: 'Create Account' },
    { href: '/account/orders', label: 'My Orders' },
    { href: '/account/profile', label: 'Profile' },
    { href: '/wishlist', label: 'Wishlist' },
  ],
  Support: [
    { href: '/faq', label: 'FAQ' },
    { href: '/track-order', label: 'Track Order' },
    { href: '/account/returns', label: 'Returns & Exchanges' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/press', label: 'Press & Media' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.newsletter}`}>
        <NewsletterSignup />
      </div>

      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            Next<span>Commerce</span>
          </Link>
          <p className={styles.tagline}>
            Premium footwear for every occasion.
            <br />
            Built with Next.js &amp; NestJS.
          </p>
        </div>

        {Object.entries(FOOTER_LINKS).map(([group, links]) => (
          <div key={group} className={styles.group}>
            <h4 className={styles.groupTitle}>{group}</h4>
            <ul className={styles.groupLinks}>
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={styles.groupLink}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <span className={styles.copy}>© {new Date().getFullYear()} NextCommerce. All rights reserved.</span>
          <div className={styles.legal}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
