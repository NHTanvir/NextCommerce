import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface Props {
  cents: number;
  style?: object;
  large?: boolean;
}

export function PriceTag({ cents, style, large }: Props) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);

  return (
    <Text style={[large ? styles.large : styles.normal, style]}>
      {formatted}
    </Text>
  );
}

const styles = StyleSheet.create({
  normal: { fontSize: 15, fontWeight: '800', color: '#e94560' },
  large: { fontSize: 24, fontWeight: '900', color: '#e94560' },
});
