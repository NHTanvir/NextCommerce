'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePurchaseGiftCardMutation, useCheckGiftCardBalanceQuery } from '@/store/api/gift-cards.api';
import styles from './gift-cards.module.scss';

const AMOUNTS = [2500, 5000, 10000, 25000, 50000, 100000]; // cents

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

export default function GiftCardsPage() {
  const [tab, setTab] = useState<'buy' | 'check'>('buy');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [purchased, setPurchased] = useState<{ code: string; amount: number } | null>(null);

  const [checkCode, setCheckCode] = useState('');
  const [checkCodeSubmitted, setCheckCodeSubmitted] = useState('');

  const [purchaseCard, { isLoading: purchasing }] = usePurchaseGiftCardMutation();
  const { data: balance, isLoading: checking } = useCheckGiftCardBalanceQuery(checkCodeSubmitted, {
    skip: !checkCodeSubmitted,
  });

  const finalAmount = selectedAmount ?? (customAmount ? Math.round(Number(customAmount) * 100) : 0);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalAmount || finalAmount < 500) return;
    try {
      const card = await purchaseCard({
        amountCents: finalAmount,
        recipientEmail: recipientEmail || undefined,
        recipientName: recipientName || undefined,
        message: message || undefined,
      }).unwrap();
      setPurchased({ code: card.code, amount: card.initialAmountCents });
    } catch {
      // handled by RTK
    }
  };

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Gift Cards</h1>
        <p className={styles.heroSub}>
          Give the gift of style. Recipients can use it on any order at NextCommerce.
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'buy' ? styles.tabActive : ''}`}
          onClick={() => setTab('buy')}
        >
          Buy a Gift Card
        </button>
        <button
          className={`${styles.tab} ${tab === 'check' ? styles.tabActive : ''}`}
          onClick={() => setTab('check')}
        >
          Check Balance
        </button>
      </div>

      {tab === 'buy' && (
        <>
          {purchased ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>🎁</div>
              <h2 className={styles.successTitle}>Gift Card Purchased!</h2>
              <p className={styles.successSub}>Share this code with the recipient:</p>
              <div className={styles.codeBox}>
                <span className={styles.code}>{purchased.code}</span>
                <button
                  className={styles.copyBtn}
                  onClick={() => navigator.clipboard.writeText(purchased.code)}
                >
                  Copy
                </button>
              </div>
              <p className={styles.successNote}>Value: {formatPrice(purchased.amount)} · Expires in 1 year</p>
              <button className="btn btn--outline" onClick={() => setPurchased(null)}>Buy Another</button>
            </div>
          ) : (
            <form className={styles.buyForm} onSubmit={handlePurchase}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Select Amount</h3>
                <div className={styles.amountGrid}>
                  {AMOUNTS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`${styles.amountBtn} ${selectedAmount === a ? styles.amountBtnActive : ''}`}
                      onClick={() => { setSelectedAmount(a); setCustomAmount(''); }}
                    >
                      {formatPrice(a)}
                    </button>
                  ))}
                </div>
                <div className={styles.customRow}>
                  <span className={styles.dollarSign}>$</span>
                  <input
                    className={styles.customInput}
                    type="number"
                    placeholder="Custom amount"
                    min={5}
                    max={500}
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  />
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Recipient (Optional)</h3>
                <input
                  className={styles.input}
                  placeholder="Recipient's name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
                <input
                  className={styles.input}
                  type="email"
                  placeholder="Recipient's email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
                <textarea
                  className={styles.textarea}
                  placeholder="Personal message (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--lg"
                disabled={purchasing || !finalAmount || finalAmount < 500}
              >
                {purchasing ? 'Processing…' : `Purchase ${finalAmount ? formatPrice(finalAmount) : ''} Gift Card`}
              </button>
            </form>
          )}
        </>
      )}

      {tab === 'check' && (
        <div className={styles.checkSection}>
          <div className={styles.checkForm}>
            <input
              className={styles.input}
              placeholder="Enter gift card code (e.g. ABCD-1234-EFGH-5678)"
              value={checkCode}
              onChange={(e) => setCheckCode(e.target.value)}
            />
            <button
              className="btn btn--primary"
              onClick={() => setCheckCodeSubmitted(checkCode.toUpperCase())}
              disabled={!checkCode || checking}
            >
              {checking ? 'Checking…' : 'Check Balance'}
            </button>
          </div>

          {balance && checkCodeSubmitted && (
            <div className={`${styles.balanceResult} ${balance.isValid ? styles.balanceValid : styles.balanceInvalid}`}>
              {balance.isValid ? (
                <>
                  <p className={styles.balanceAmount}>${(balance.remaining / 100).toFixed(2)} remaining</p>
                  {balance.expiresAt && (
                    <p className={styles.balanceExpiry}>
                      Expires {new Date(balance.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </>
              ) : (
                <p className={styles.balanceError}>This gift card is invalid, expired, or has no remaining balance.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
