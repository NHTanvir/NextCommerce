'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './SizeGuide.module.scss';

type Gender = 'mens' | 'womens' | 'kids';

interface SizeRow {
  us: string;
  eu: string;
  uk: string;
  cm: string;
}

const MENS: SizeRow[] = [
  { us: '6',    eu: '38.5', uk: '5.5',  cm: '24.0' },
  { us: '6.5',  eu: '39',   uk: '6',    cm: '24.5' },
  { us: '7',    eu: '40',   uk: '6.5',  cm: '25.0' },
  { us: '7.5',  eu: '40.5', uk: '7',    cm: '25.4' },
  { us: '8',    eu: '41',   uk: '7.5',  cm: '26.0' },
  { us: '8.5',  eu: '42',   uk: '8',    cm: '26.7' },
  { us: '9',    eu: '42.5', uk: '8.5',  cm: '27.0' },
  { us: '9.5',  eu: '43',   uk: '9',    cm: '27.5' },
  { us: '10',   eu: '44',   uk: '9.5',  cm: '28.0' },
  { us: '10.5', eu: '44.5', uk: '10',   cm: '28.5' },
  { us: '11',   eu: '45',   uk: '10.5', cm: '29.0' },
  { us: '11.5', eu: '45.5', uk: '11',   cm: '29.4' },
  { us: '12',   eu: '46',   uk: '11.5', cm: '30.0' },
  { us: '13',   eu: '47.5', uk: '12.5', cm: '31.0' },
];

const WOMENS: SizeRow[] = [
  { us: '5',    eu: '35.5', uk: '3',    cm: '21.6' },
  { us: '5.5',  eu: '36',   uk: '3.5',  cm: '22.0' },
  { us: '6',    eu: '36.5', uk: '4',    cm: '22.5' },
  { us: '6.5',  eu: '37.5', uk: '4.5',  cm: '23.0' },
  { us: '7',    eu: '38',   uk: '5',    cm: '23.5' },
  { us: '7.5',  eu: '38.5', uk: '5.5',  cm: '24.0' },
  { us: '8',    eu: '39',   uk: '6',    cm: '24.5' },
  { us: '8.5',  eu: '39.5', uk: '6.5',  cm: '25.0' },
  { us: '9',    eu: '40',   uk: '7',    cm: '25.5' },
  { us: '9.5',  eu: '40.5', uk: '7.5',  cm: '26.0' },
  { us: '10',   eu: '41',   uk: '8',    cm: '26.5' },
  { us: '11',   eu: '42.5', uk: '9',    cm: '27.5' },
];

const KIDS: SizeRow[] = [
  { us: '1Y',   eu: '32',   uk: '13.5', cm: '20.0' },
  { us: '2Y',   eu: '33.5', uk: '1',    cm: '21.0' },
  { us: '3Y',   eu: '35',   uk: '2.5',  cm: '22.0' },
  { us: '4Y',   eu: '36',   uk: '3.5',  cm: '23.0' },
  { us: '5Y',   eu: '37.5', uk: '4.5',  cm: '24.0' },
  { us: '6Y',   eu: '38.5', uk: '5.5',  cm: '25.0' },
  { us: '7Y',   eu: '40',   uk: '6.5',  cm: '25.5' },
];

const DATA: Record<Gender, SizeRow[]> = { mens: MENS, womens: WOMENS, kids: KIDS };

interface SizeGuideProps {
  open: boolean;
  onClose: () => void;
}

export function SizeGuide({ open, onClose }: SizeGuideProps) {
  const [gender, setGender] = useState<Gender>('mens');
  const [highlight, setHighlight] = useState<string | null>(null);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  if (!open) return null;

  const rows = DATA[gender];

  return (
    <div className={styles.backdrop} onClick={close}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Size Guide</h2>
          <button className={styles.closeBtn} onClick={close} aria-label="Close">✕</button>
        </div>

        <div className={styles.tabs}>
          {(['mens', 'womens', 'kids'] as Gender[]).map((g) => (
            <button
              key={g}
              className={`${styles.tab} ${gender === g ? styles.tabActive : ''}`}
              onClick={() => { setGender(g); setHighlight(null); }}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>US</th>
                <th>EU</th>
                <th>UK</th>
                <th>CM</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.us}
                  className={`${styles.row} ${highlight === r.us ? styles.rowHighlighted : ''}`}
                  onClick={() => setHighlight(highlight === r.us ? null : r.us)}
                >
                  <td className={styles.usCell}>{r.us}</td>
                  <td>{r.eu}</td>
                  <td>{r.uk}</td>
                  <td>{r.cm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.hint}>Click a row to highlight your size</p>

        <div className={styles.tip}>
          <strong>How to measure:</strong> Stand on a flat surface and measure from your heel to the tip of your longest toe in cm. If between sizes, go up half a size.
        </div>
      </div>
    </div>
  );
}
