'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCartTotal, clearCart } from '@/store/slices/cart.slice';
import { useCreateOrderMutation } from '@/store/api/orders.api';
import { useGetShippingRatesQuery } from '@/store/api/shipping.api';
import type { ShippingRate } from '@/store/api/shipping.api';
import styles from './checkout.module.scss';

interface AddressForm {
  line1: string;
  line2: string;
  city: string;
  country: string;
  postalCode: string;
}

type Step = 'address' | 'shipping' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const total = useAppSelector(selectCartTotal);
  const anonymousToken = useAppSelector((s) => s.cart.anonymousToken);

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [address, setAddress] = useState<AddressForm>({
    line1: '', line2: '', city: '', country: 'US', postalCode: '',
  });
  const [step, setStep] = useState<Step>('address');
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [error, setError] = useState('');

  const { data: shippingEstimate, isFetching: ratesLoading } = useGetShippingRatesQuery(
    { total, country: address.country },
    { skip: step === 'address' },
  );

  const shippingCost = selectedRate?.priceCents ?? 0;

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Your cart is empty</h2>
        <Link href="/products" className="btn btn--primary">Shop Now</Link>
      </div>
    );
  }

  function handleAddressContinue() {
    setStep('shipping');
    setSelectedRate(null);
  }

  function handleShippingContinue() {
    if (!selectedRate) return;
    setStep('review');
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

  const STEPS: { key: Step; label: string }[] = [
    { key: 'address', label: 'Address' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'review', label: 'Review' },
  ];

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.pageTitle}>Checkout</h1>

      <div className={styles.stepper}>
        {STEPS.map((s, i) => {
          const stepIndex = STEPS.findIndex((x) => x.key === step);
          const isDone = i < stepIndex;
          const isActive = s.key === step;
          return (
            <div key={s.key} className={styles.stepItem}>
              <div className={`${styles.stepDot} ${isActive ? styles.stepDotActive : ''} ${isDone ? styles.stepDotDone : ''}`}>
                {isDone ? '✓' : i + 1}
              </div>
              <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${isDone ? styles.stepLineDone : ''}`} />}
            </div>
          );
        })}
      </div>

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
                  onClick={handleAddressContinue}
                >
                  Continue to Shipping →
                </button>
              </div>
            </div>
          )}

          {step === 'shipping' && (
            <div className={styles.section}>
              <div className={styles.reviewHeader}>
                <h2 className={styles.sectionTitle}>Shipping Method</h2>
                <button className="btn btn--ghost btn--sm" onClick={() => setStep('address')}>
                  ← Edit Address
                </button>
              </div>

              {ratesLoading ? (
                <div className={styles.ratesLoading}>Loading shipping rates…</div>
              ) : (
                <div className={styles.ratesList}>
                  {shippingEstimate?.rates.map((rate) => (
                    <button
                      key={rate.id}
                      className={`${styles.rateOption} ${selectedRate?.id === rate.id ? styles.rateOptionSelected : ''}`}
                      onClick={() => setSelectedRate(rate)}
                    >
                      <div className={styles.rateRadio}>
                        <div className={`${styles.rateRadioInner} ${selectedRate?.id === rate.id ? styles.rateRadioInnerFilled : ''}`} />
                      </div>
                      <div className={styles.rateInfo}>
                        <div className={styles.rateName}>
                          {rate.name}
                          {rate.isFree && <span className={styles.rateFreeTag}>FREE</span>}
                        </div>
                        <div className={styles.rateMeta}>
                          {rate.carrier} · {rate.deliveryDays}
                        </div>
                      </div>
                      <div className={styles.ratePrice}>
                        {rate.isFree ? (
                          <span className={styles.ratePriceFree}>Free</span>
                        ) : (
                          `$${(rate.priceCents / 100).toFixed(2)}`
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <button
                className="btn btn--primary btn--lg"
                style={{ width: '100%' }}
                disabled={!selectedRate}
                onClick={handleShippingContinue}
              >
                Continue to Review →
              </button>
            </div>
          )}

          {step === 'review' && (
            <div className={styles.section}>
              <div className={styles.reviewHeader}>
                <h2 className={styles.sectionTitle}>Review Order</h2>
                <button className="btn btn--ghost btn--sm" onClick={() => setStep('shipping')}>
                  ← Edit Shipping
                </button>
              </div>

              <div className={styles.reviewCards}>
                <div className={styles.reviewCard}>
                  <p className={styles.reviewCardLabel}>Delivery Address</p>
                  <p className={styles.addressLine}>{address.line1}</p>
                  {address.line2 && <p className={styles.addressLine}>{address.line2}</p>}
                  <p className={styles.addressLine}>{address.city}, {address.postalCode}</p>
                  <p className={styles.addressLine}>{address.country}</p>
                </div>
                {selectedRate && (
                  <div className={styles.reviewCard}>
                    <p className={styles.reviewCardLabel}>Shipping Method</p>
                    <p className={styles.reviewShippingName}>{selectedRate.name}</p>
                    <p className={styles.reviewShippingMeta}>
                      {selectedRate.carrier} · {selectedRate.deliveryDays}
                    </p>
                  </div>
                )}
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
                {isLoading ? 'Placing Order…' : `Place Order · $${((total + shippingCost) / 100).toFixed(2)}`}
              </button>
            </div>
          )}
        </div>

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
                <span>
                  {step === 'address'
                    ? '—'
                    : selectedRate
                    ? selectedRate.isFree
                      ? 'Free'
                      : `$${(selectedRate.priceCents / 100).toFixed(2)}`
                    : 'Select a method'}
                </span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>${((total + shippingCost) / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
