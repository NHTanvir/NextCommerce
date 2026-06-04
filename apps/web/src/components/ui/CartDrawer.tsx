'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCartTotal,
  setCartOpen,
  removeItem,
  updateQuantity,
} from '@/store/slices/cart.slice';
import styles from './CartDrawer.module.scss';

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.cart.isOpen);
  const items = useAppSelector((s) => s.cart.items);
  const total = useAppSelector(selectCartTotal);
  const drawerRef = useRef<HTMLDivElement>(null);

  const shipping = total > 0 && total < 7500 ? 799 : 0;

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(setCartOpen(false));
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className={styles.backdrop}
        onClick={() => dispatch(setCartOpen(false))}
        aria-hidden
      />
      <aside
        ref={drawerRef}
        className={styles.drawer}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            Cart
            {items.length > 0 && (
              <span className={styles.count}>{items.length}</span>
            )}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={() => dispatch(setCartOpen(false))}
            aria-label="Close cart"
          >
            ✕
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
              Shop Now
            </Link>
          </div>
        ) : (
          <>
            <ul className={styles.itemList}>
              {items.map((item) => (
                <li key={item.variantId} className={styles.item}>
                  <div className={styles.imgWrap}>
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="72px"
                      />
                    ) : (
                      <span className={styles.imgPlaceholder}>👟</span>
                    )}
                  </div>

                  <div className={styles.itemBody}>
                    <p className={styles.itemTitle}>{item.title}</p>
                    <p className={styles.itemMeta}>
                      Size {item.size} · {item.color}
                    </p>
                    <div className={styles.itemRow}>
                      <div className={styles.qtyControl}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() =>
                            item.quantity <= 1
                              ? dispatch(removeItem(item.variantId))
                              : dispatch(updateQuantity({ variantId: item.variantId, quantity: item.quantity - 1 }))
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
                      </div>
                      <span className={styles.itemPrice}>
                        ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => dispatch(removeItem(item.variantId))}
                    aria-label={`Remove ${item.title} from cart`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <div className={styles.footer}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${(shipping / 100).toFixed(2)}`}</span>
              </div>
              {total < 7500 && total > 0 && (
                <p className={styles.freeShippingNote}>
                  Add ${((7500 - total) / 100).toFixed(2)} more for free shipping
                </p>
              )}
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>${((total + shipping) / 100).toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                className="btn btn--primary btn--lg"
                style={{ width: '100%', textAlign: 'center' }}
                onClick={() => dispatch(setCartOpen(false))}
              >
                Checkout · ${((total + shipping) / 100).toFixed(2)}
              </Link>
              <Link
                href="/cart"
                className={styles.viewCartLink}
                onClick={() => dispatch(setCartOpen(false))}
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
