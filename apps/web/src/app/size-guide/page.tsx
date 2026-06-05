'use client';

import { useState } from 'react';
import styles from './size-guide.module.scss';

type Category = 'mens-sneakers' | 'womens-sneakers' | 'kids-sneakers' | 'apparel';
type Unit = 'us' | 'uk' | 'eu' | 'cm';

const SIZE_DATA: Record<string, { us: string; uk: string; eu: string; cm: string }[]> = {
  'mens-sneakers': [
    { us: '6', uk: '5.5', eu: '38.5', cm: '24.0' },
    { us: '6.5', uk: '6', eu: '39', cm: '24.4' },
    { us: '7', uk: '6.5', eu: '40', cm: '24.8' },
    { us: '7.5', uk: '7', eu: '40.5', cm: '25.2' },
    { us: '8', uk: '7.5', eu: '41', cm: '25.7' },
    { us: '8.5', uk: '8', eu: '42', cm: '26.1' },
    { us: '9', uk: '8.5', eu: '42.5', cm: '26.5' },
    { us: '9.5', uk: '9', eu: '43', cm: '26.9' },
    { us: '10', uk: '9.5', eu: '44', cm: '27.3' },
    { us: '10.5', uk: '10', eu: '44.5', cm: '27.7' },
    { us: '11', uk: '10.5', eu: '45', cm: '28.2' },
    { us: '11.5', uk: '11', eu: '45.5', cm: '28.6' },
    { us: '12', uk: '11.5', eu: '46', cm: '29.0' },
    { us: '13', uk: '12.5', eu: '47.5', cm: '30.0' },
    { us: '14', uk: '13.5', eu: '48.5', cm: '31.0' },
  ],
  'womens-sneakers': [
    { us: '5', uk: '2.5', eu: '35.5', cm: '21.6' },
    { us: '5.5', uk: '3', eu: '36', cm: '22.1' },
    { us: '6', uk: '3.5', eu: '36.5', cm: '22.5' },
    { us: '6.5', uk: '4', eu: '37', cm: '23.0' },
    { us: '7', uk: '4.5', eu: '37.5', cm: '23.4' },
    { us: '7.5', uk: '5', eu: '38', cm: '23.8' },
    { us: '8', uk: '5.5', eu: '38.5', cm: '24.2' },
    { us: '8.5', uk: '6', eu: '39', cm: '24.7' },
    { us: '9', uk: '6.5', eu: '39.5', cm: '25.1' },
    { us: '9.5', uk: '7', eu: '40', cm: '25.5' },
    { us: '10', uk: '7.5', eu: '40.5', cm: '26.0' },
    { us: '10.5', uk: '8', eu: '41', cm: '26.4' },
    { us: '11', uk: '8.5', eu: '41.5', cm: '26.8' },
    { us: '12', uk: '9.5', eu: '43', cm: '27.9' },
  ],
  'kids-sneakers': [
    { us: '3.5Y', uk: '3', eu: '35.5', cm: '22.2' },
    { us: '4Y', uk: '3.5', eu: '36', cm: '22.6' },
    { us: '4.5Y', uk: '4', eu: '36.5', cm: '23.0' },
    { us: '5Y', uk: '4.5', eu: '37.5', cm: '23.5' },
    { us: '5.5Y', uk: '5', eu: '38', cm: '23.9' },
    { us: '6Y', uk: '5.5', eu: '38.5', cm: '24.3' },
    { us: '6.5Y', uk: '6', eu: '39', cm: '24.8' },
    { us: '7Y', uk: '6.5', eu: '40', cm: '25.2' },
  ],
  apparel: [
    { us: 'XS', uk: 'XS', eu: 'XXS/XS', cm: 'Chest: 32–34"' },
    { us: 'S', uk: 'S', eu: 'S', cm: 'Chest: 35–37"' },
    { us: 'M', uk: 'M', eu: 'M', cm: 'Chest: 38–40"' },
    { us: 'L', uk: 'L', eu: 'L', cm: 'Chest: 41–43"' },
    { us: 'XL', uk: 'XL', eu: 'XL', cm: 'Chest: 44–46"' },
    { us: '2XL', uk: 'XXL', eu: 'XXL', cm: 'Chest: 47–49"' },
    { us: '3XL', uk: '3XL', eu: '3XL', cm: 'Chest: 50–52"' },
  ],
};

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'mens-sneakers', label: "Men's Sneakers", icon: '👟' },
  { id: 'womens-sneakers', label: "Women's Sneakers", icon: '👡' },
  { id: 'kids-sneakers', label: "Kids' Sneakers", icon: '🧒' },
  { id: 'apparel', label: 'Apparel', icon: '👕' },
];

const UNIT_LABELS: Record<Unit, string> = {
  us: 'US Size',
  uk: 'UK Size',
  eu: 'EU Size',
  cm: 'Length (cm)',
};

const HOW_TO_MEASURE = [
  {
    step: 1,
    title: 'Trace your foot',
    desc: 'Place a piece of paper on the floor and trace around your foot while standing. Keep the pencil perpendicular to the paper.',
  },
  {
    step: 2,
    title: 'Measure the length',
    desc: 'Using a ruler, measure the distance from the heel to the tip of your longest toe. Record this in centimeters.',
  },
  {
    step: 3,
    title: 'Find your size',
    desc: 'Compare your measurement to our size chart. If you are between sizes, we recommend sizing up for a more comfortable fit.',
  },
  {
    step: 4,
    title: 'Check both feet',
    desc: "Feet are rarely identical. Always measure both feet and use the larger measurement when selecting your size.",
  },
];

export default function SizeGuidePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('mens-sneakers');
  const [highlightUnit, setHighlightUnit] = useState<Unit | null>(null);
  const [findCm, setFindCm] = useState('');

  const data = SIZE_DATA[activeCategory] ?? [];

  const highlightRow = findCm.trim()
    ? data.find((row) => row.cm.startsWith(findCm))?.us ?? null
    : null;

  const isApparel = activeCategory === 'apparel';

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Size Guide</h1>
        <p className={styles.subtitle}>Find your perfect fit with our comprehensive size charts.</p>
      </div>

      <div className={`container ${styles.body}`}>
        {/* Category selector */}
        <div className={styles.categoryTabs}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.catTab} ${activeCategory === cat.id ? styles.catTabActive : ''}`}
              onClick={() => { setActiveCategory(cat.id); setFindCm(''); setHighlightUnit(null); }}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Size finder */}
        {!isApparel && (
          <div className={styles.finder}>
            <label className={styles.finderLabel}>Find your size by foot length (cm):</label>
            <div className={styles.finderRow}>
              <input
                type="number"
                step="0.1"
                min="20"
                max="32"
                placeholder="e.g. 26.5"
                className={styles.finderInput}
                value={findCm}
                onChange={(e) => setFindCm(e.target.value)}
              />
              {highlightRow && (
                <span className={styles.finderResult}>
                  → US Size <strong>{highlightRow}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Size chart */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {(['us', 'uk', 'eu', 'cm'] as Unit[]).map((unit) => (
                  <th
                    key={unit}
                    className={`${styles.th} ${highlightUnit === unit ? styles.thHighlight : ''}`}
                    onClick={() => setHighlightUnit(highlightUnit === unit ? null : unit)}
                    title={`Click to highlight ${UNIT_LABELS[unit]}`}
                  >
                    {UNIT_LABELS[unit]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const isFound = !isApparel && highlightRow && row.us === highlightRow;
                return (
                  <tr key={i} className={isFound ? styles.rowHighlight : ''}>
                    {(['us', 'uk', 'eu', 'cm'] as Unit[]).map((unit) => (
                      <td
                        key={unit}
                        className={`${styles.td} ${highlightUnit === unit ? styles.tdHighlight : ''}`}
                      >
                        {row[unit]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* How to measure */}
        {!isApparel && (
          <section className={styles.measureSection}>
            <h2 className={styles.sectionTitle}>How to Measure Your Foot</h2>
            <div className={styles.stepsGrid}>
              {HOW_TO_MEASURE.map((s) => (
                <div key={s.step} className={styles.step}>
                  <div className={styles.stepNum}>{s.step}</div>
                  <div>
                    <h3 className={styles.stepTitle}>{s.title}</h3>
                    <p className={styles.stepDesc}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tips */}
        <section className={styles.tipsSection}>
          <h2 className={styles.sectionTitle}>Fit Tips</h2>
          <ul className={styles.tipsList}>
            <li>Measure your feet in the afternoon — they tend to swell slightly throughout the day.</li>
            <li>Wear the type of socks you plan to wear with the shoes when measuring.</li>
            <li>For running shoes, consider going half a size up for comfort during long runs.</li>
            <li>Different brands may fit differently. Always check brand-specific notes on product pages.</li>
            <li>Still unsure? Our customer support team is happy to help find the right size for you.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
