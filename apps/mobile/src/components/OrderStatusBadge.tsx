import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; label: string }> = {
  pending: { color: '#fff', bg: '#f59e0b', label: 'Pending' },
  paid: { color: '#fff', bg: '#3b82f6', label: 'Paid' },
  processing: { color: '#fff', bg: '#8b5cf6', label: 'Processing' },
  shipped: { color: '#fff', bg: '#06b6d4', label: 'Shipped' },
  delivered: { color: '#fff', bg: '#10b981', label: 'Delivered' },
  cancelled: { color: '#fff', bg: '#ef4444', label: 'Cancelled' },
  refunded: { color: '#fff', bg: '#6b7280', label: 'Refunded' },
};

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export function OrderStatusBadge({ status, size = 'md' }: Props) {
  const config = STATUS_CONFIG[status as OrderStatus] ?? { color: '#fff', bg: '#6b7280', label: status };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, size === 'sm' ? styles.sm : styles.md]}>
      <Text style={[styles.text, { color: config.color }, size === 'sm' ? styles.textSm : styles.textMd]}>
        {config.label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: 6, paddingVertical: 2 },
  md: { paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontWeight: '700', letterSpacing: 0.5 },
  textSm: { fontSize: 9 },
  textMd: { fontSize: 11 },
});
