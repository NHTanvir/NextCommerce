'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCartTotal, clearCart } from '@/store/slices/cart.slice';
import { useCreateOrderMutation } from '@/store/api/orders.api';
import styles from './checkout.module.scss';

interface AddressForm {
  line1: string;
  line2: string;
  city: string;
  country: string;
  postalCode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const total = useAppSelector(selectCartTotal);
  const anonymousToken = useAppSelector((s) => s.cart.anonymousToken);
  const user = useAppSelector((s) => s.auth.user);

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [address, setAddress] = useState<AddressForm>({
    line1: '', line2: '', city: '', country: 'US', postalCode: '',
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState<'address' | 'review'>('address');

  const shipping = total >= 7500 ? 0 : 799;

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Your cart is empty</h2>
        <Link href="/products" className="btn btn--primary">Shop Now</Link>
      </div>
    );
  }

  async function handlePlaceOrder() {
    setError('');
    try {
      const order = await createOrder({
        addressLine1: address.line1,
        addressLine2: address.line2 || undefined,
        city: address.city,
        country: address.country,
        postalCode: address.postalCode,
        anonymousToken: anonymousToken ?? undefined,
      }).unwrap();
      dispatch(clearCart());
      router.push(`/account/orders/${order.id}?placed=true`);
    } catch (err: any) {
      setError(err?.data?.message ?? 'Failed to place order. Please try again.');
    }
  }

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.pageTitle}>Checkout</h1>

      <div className={styles.layout}>
        <div className={styles.main}>
          {step === 'address' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Shipping Address</h2>
              <div className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Address Line 1 *</label>
                    <input
                      className={styles.input}
                      required
                      placeholder="123 Main St"
                      value={address.line1}
                      onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Address Line 2</label>
                    <input
                      className={styles.input}
                      placeholder="Apt, Suite, etc."
                      value={address.line2}
                      onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
                    />
                  </div>
                </div>
                <div className={styles.formRow2}>
                  <div className={styles.field}>
                    <label className={styles.label}>City *</label>
                    <input
                      className={styles.input}
                      required
                      placeholder="New York"
                      value={address.city}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Postal Code *</label>
                    <input
                      className={styles.input}
                      required
                      placeholder="10001"
                      value={address.postalCode}
                      onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Country *</label>
                    <select
                      className={styles.select}
                      value={address.country}
                      onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="BD">Bangladesh</option>
                    </select>
                  </div>
                </div>
                <button
                  className="btn btn--primary btn--lg"
                  style={{ width: '100%' }}
                  disabled={!address.line1 || !address.city || !address.postalCode}
                  onClick={() => setStep('review')}
                >
                  Continue to Review →
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className={styles.section}>
              <div className={styles.reviewHeader}>
                <h2 className={styles.sectionTitle}>Review Order</h2>
                <button className="btn btn--ghost btn--sm" onClick={() => setStep('address')}>
                  ← Edit Address
                </button>
              </div>

              <div className={styles.addressCard}>
                <p className={styles.addressLine}>{address.line1}</p>
                {address.line2 && <p className={styles.addressLine}>{address.line2}</p>}
                <p className={styles.addressLine}>{address.city}, {address.postalCode}</p>
                <p className={styles.addressLine}>{address.country}</p>
              </div>

              {error && <div className={styles.errorBox}>{error}</div>}

              <div className={styles.paymentNote}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Payment is mocked — no real card needed
              </div>

              <button
                className="btn btn--primary btn--lg"
                style={{ width: '100%', height: 52 }}
                onClick={handlePlaceOrder}
                disabled={isLoading}
              >
                {isLoading ? 'Placing Order…' : `Place Order · $${((total + shipping) / 100).toFixed(2)}`}
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <aside className={styles.sidebar}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <ul className={styles.itemList}>
              {items.map((item) => (
                <li key={item.variantId} className={styles.summaryItem}>
                  <div>
                    <p className={styles.itemName}>{item.title}</p>
                    <p className={styles.itemMeta}>Size {item.size} · {item.color} · ×{item.quantity}</p>
                  </div>
                  <span className={styles.itemPrice}>${((item.priceCents * item.quantity) / 100).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : '$7.99'}</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>${((total + shipping) / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
