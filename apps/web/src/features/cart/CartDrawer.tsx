'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setCartOpen,
  updateQuantity,
  removeItem,
  selectCartItemCount,
  selectCartTotal,
} from '@/store/slices/cart.slice';
import styles from './CartDrawer.module.scss';

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.cart.isOpen);
  const items = useAppSelector((s) => s.cart.items);
  const total = useAppSelector(selectCartTotal);
  const count = useAppSelector(selectCartItemCount);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={() => dispatch(setCartOpen(false))} />
      <aside className={styles.drawer} role="dialog" aria-label="Shopping cart" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>
            Cart
            {count > 0 && <span className={styles.count}>{count}</span>}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={() => dispatch(setCartOpen(false))}
            aria-label="Close cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🛒</span>
            <p className={styles.emptyText}>Your cart is empty</p>
            <Link
              href="/products"
              className="btn btn--primary"
              onClick={() => dispatch(setCartOpen(false))}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className={styles.items} role="list">
              {items.map((item) => (
                <li key={item.variantId} className={styles.item}>
                  <div className={styles.itemImage}>
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.title} fill sizes="72px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <span>👟</span>
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <Link
                      href={`/products/${item.slug}`}
                      className={styles.itemTitle}
                      onClick={() => dispatch(setCartOpen(false))}
                    >
                      {item.title}
                    </Link>
                    <span className={styles.itemMeta}>
                      Size {item.size} · {item.color}
                    </span>
                    <div className={styles.itemBottom}>
                      <span className={styles.itemPrice}>
                        ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                      </span>
                      <div className={styles.itemControls}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() =>
                            dispatch(updateQuantity({ variantId: item.variantId, quantity: item.quantity - 1 }))
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className={styles.qtyNum}>{item.quantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() =>
                            dispatch(updateQuantity({ variantId: item.variantId, quantity: item.quantity + 1 }))
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                        <button
                          className={styles.removeBtn}
                          onClick={() => dispatch(removeItem(item.variantId))}
                          aria-label="Remove item"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.footer}>
              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>{total >= 7500 ? 'Free' : '$7.99'}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Total</span>
                  <span>${((total + (total >= 7500 ? 0 : 799)) / 100).toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className={`btn btn--primary ${styles.checkoutBtn}`}
                onClick={() => dispatch(setCartOpen(false))}
              >
                Checkout →
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
