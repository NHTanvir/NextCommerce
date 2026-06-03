'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';
import { LoyaltyWidget } from '@/components/features/LoyaltyWidget';
import styles from './loyalty.module.scss';

const TIER_BENEFITS: Record<string, string[]> = {
  bronze: ['Earn 10 pts per $1 spent', 'Birthday bonus: 50 pts', 'Early sale access'],
  silver: ['Earn 12 pts per $1 spent', 'Birthday bonus: 100 pts', 'Free standard shipping', 'Priority support'],
  gold: ['Earn 15 pts per $1 spent', 'Birthday bonus: 250 pts', 'Free express shipping', 'Dedicated support', '5% off all orders'],
  platinum: ['Earn 20 pts per $1 spent', 'Birthday bonus: 500 pts', 'Free overnight shipping', 'VIP support', '10% off all orders', 'Exclusive product drops'],
};

export default function LoyaltyPage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Rewards</h1>
        <p className={styles.sub}>
          Earn points on every purchase and unlock exclusive benefits.
        </p>
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          <LoyaltyWidget />
        </div>

        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>How It Works</h3>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNum}>1</div>
                <div>
                  <p className={styles.stepTitle}>Shop & Earn</p>
                  <p className={styles.stepDesc}>Earn points on every dollar spent at NextCommerce.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>2</div>
                <div>
                  <p className={styles.stepTitle}>Climb the Tiers</p>
                  <p className={styles.stepDesc}>Unlock better rewards as you accumulate lifetime points.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>3</div>
                <div>
                  <p className={styles.stepTitle}>Redeem for Discounts</p>
                  <p className={styles.stepDesc}>100 points = $1 off your next order. No minimum required.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Tier Benefits</h3>
            <div className={styles.tiers}>
              {(['bronze', 'silver', 'gold', 'platinum'] as const).map((tier) => (
                <div key={tier} className={styles.tier}>
                  <p className={styles.tierName}>
                    {tier === 'bronze' && '🥉'}
                    {tier === 'silver' && '🥈'}
                    {tier === 'gold' && '🥇'}
                    {tier === 'platinum' && '💎'}
                    {' '}{tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </p>
                  <ul className={styles.tierBenefits}>
                    {TIER_BENEFITS[tier].map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
