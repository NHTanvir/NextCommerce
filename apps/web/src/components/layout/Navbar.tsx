'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/auth.slice';
import { toggleCart } from '@/store/slices/cart.slice';
import { selectCartItemCount } from '@/store/slices/cart.slice';
import styles from './Navbar.module.scss';

const NAV_LINKS = [
  { href: '/products', label: 'Shop' },
  { href: '/products?category=running', label: 'Running' },
  { href: '/products?category=lifestyle', label: 'Lifestyle' },
  { href: '/products?category=basketball', label: 'Basketball' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const cartCount = useAppSelector(selectCartItemCount);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    dispatch(logout());
    localStorage.removeItem('nc_token');
    localStorage.removeItem('nc_user');
    setDropdownOpen(false);
    router.push('/');
  }

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          Next<span>Commerce</span>
        </Link>

        <div className={styles.links}>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.link} ${pathname === l.href ? styles.active : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          <Link href="/products?search=" className={styles.searchBtn} aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </Link>

          <button
            className={styles.cartBtn}
            onClick={() => dispatch(toggleCart())}
            aria-label={`Cart (${cartCount} items)`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>}
          </button>

          {user ? (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button
                className={styles.userBtn}
                onClick={() => setDropdownOpen((o) => !o)}
                aria-expanded={dropdownOpen}
                aria-label="User menu"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown} role="menu">
                  <Link href="/account/orders" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    My Orders
                  </Link>
                  <Link href="/account/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    Profile
                  </Link>
                  {user.role === 'admin' && (
                    <>
                      <div className={styles.dropdownDivider} />
                      <Link href="/admin" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        Admin Dashboard
                      </Link>
                    </>
                  )}
                  <div className={styles.dropdownDivider} />
                  <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={handleLogout} role="menuitem">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="btn btn--outline btn--sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
