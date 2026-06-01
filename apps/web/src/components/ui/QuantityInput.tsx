'use client';

import styles from './QuantityInput.module.scss';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
}: QuantityInputProps) {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  };

  return (
    <div className={`${styles.wrapper} ${styles[size]} ${disabled ? styles.disabled : ''}`}>
      <button
        type="button"
        className={styles.btn}
        onClick={decrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        type="number"
        className={styles.input}
        value={value}
        onChange={handleInput}
        min={min}
        max={max}
        disabled={disabled}
        aria-label="Quantity"
      />
      <button
        type="button"
        className={styles.btn}
        onClick={increment}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
