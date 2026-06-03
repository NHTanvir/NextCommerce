'use client';

import { useState, useMemo } from 'react';
import styles from './VariantSelector.module.scss';

export interface Variant {
  id: string;
  size: string;
  color: string;
  colorHex?: string;
  priceCents: number;
  stockQty: number;
  sku: string;
}

interface Props {
  variants: Variant[];
  onSelect: (variant: Variant | null) => void;
}

export function VariantSelector({ variants, onSelect }: Props) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const colors = useMemo(() => {
    const seen = new Set<string>();
    return variants.filter((v) => {
      if (seen.has(v.color)) return false;
      seen.add(v.color);
      return true;
    });
  }, [variants]);

  const sizesForColor = useMemo(() => {
    const base = selectedColor
      ? variants.filter((v) => v.color === selectedColor)
      : variants;
    const seen = new Set<string>();
    return base.filter((v) => {
      if (seen.has(v.size)) return false;
      seen.add(v.size);
      return true;
    }).sort((a, b) => {
      const numA = parseFloat(a.size);
      const numB = parseFloat(b.size);
      return isNaN(numA) || isNaN(numB) ? a.size.localeCompare(b.size) : numA - numB;
    });
  }, [variants, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return variants.find((v) => v.color === selectedColor && v.size === selectedSize) ?? null;
  }, [variants, selectedColor, selectedSize]);

  const handleColorSelect = (color: string) => {
    const next = selectedColor === color ? null : color;
    setSelectedColor(next);
    setSelectedSize(null);
    onSelect(null);
  };

  const handleSizeSelect = (size: string) => {
    const next = selectedSize === size ? null : size;
    setSelectedSize(next);
    if (next && selectedColor) {
      const v = variants.find((v) => v.color === selectedColor && v.size === next);
      onSelect(v ?? null);
    } else {
      onSelect(null);
    }
  };

  const isSizeAvailable = (size: string) => {
    if (!selectedColor) return variants.some((v) => v.size === size && v.stockQty > 0);
    return variants.some((v) => v.color === selectedColor && v.size === size && v.stockQty > 0);
  };

  return (
    <div className={styles.selector}>
      {/* Color picker */}
      {colors.length > 1 && (
        <div className={styles.group}>
          <div className={styles.groupHeader}>
            <span className={styles.groupLabel}>Color</span>
            {selectedColor && <span className={styles.groupValue}>{selectedColor}</span>}
          </div>
          <div className={styles.colorSwatches}>
            {colors.map((c) => {
              const hasStock = variants.some((v) => v.color === c.color && v.stockQty > 0);
              return (
                <button
                  key={c.color}
                  type="button"
                  className={`${styles.swatch} ${selectedColor === c.color ? styles.swatchActive : ''} ${!hasStock ? styles.swatchOOS : ''}`}
                  onClick={() => handleColorSelect(c.color)}
                  title={c.color}
                  aria-label={`${c.color}${!hasStock ? ' (out of stock)' : ''}`}
                  aria-pressed={selectedColor === c.color}
                >
                  {c.colorHex ? (
                    <span
                      className={styles.swatchColor}
                      style={{ background: c.colorHex }}
                    />
                  ) : (
                    <span className={styles.swatchLabel}>{c.color.slice(0, 2)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size picker */}
      <div className={styles.group}>
        <div className={styles.groupHeader}>
          <span className={styles.groupLabel}>Size</span>
          {selectedSize && <span className={styles.groupValue}>US {selectedSize}</span>}
        </div>
        <div className={styles.sizeGrid}>
          {sizesForColor.map((v) => {
            const available = isSizeAvailable(v.size);
            return (
              <button
                key={v.size}
                type="button"
                className={`${styles.sizeBtn} ${selectedSize === v.size ? styles.sizeBtnActive : ''} ${!available ? styles.sizeBtnOOS : ''}`}
                onClick={() => available && handleSizeSelect(v.size)}
                disabled={!available}
                aria-label={`Size ${v.size}${!available ? ' (out of stock)' : ''}`}
                aria-pressed={selectedSize === v.size}
              >
                {v.size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected variant info */}
      {selectedVariant && (
        <div className={styles.variantInfo}>
          <span className={styles.variantPrice}>
            ${(selectedVariant.priceCents / 100).toFixed(2)}
          </span>
          {selectedVariant.stockQty <= 3 && selectedVariant.stockQty > 0 && (
            <span className={`badge badge--warning ${styles.stockWarn}`}>
              Only {selectedVariant.stockQty} left
            </span>
          )}
          {selectedVariant.stockQty > 3 && (
            <span className={`badge badge--success ${styles.stockOk}`}>In Stock</span>
          )}
        </div>
      )}
    </div>
  );
}
