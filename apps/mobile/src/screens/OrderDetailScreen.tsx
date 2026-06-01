import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { fetchOrder } from '../api/orders';
import { PriceTag } from '../components/PriceTag';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

const STATUS_STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  paid: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#ef4444',
  refunded: '#6b7280',
};

export function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder(orderId)
      .then((data) => {
        setOrder(data);
        navigation.setOptions({
          title: `Order #${data.id.slice(0, 8).toUpperCase()}`,
        });
      })
      .catch(() => Alert.alert('Error', 'Failed to load order details.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Order not found.</Text>
      </View>
    );
  }

  const statusIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status tracker */}
      {statusIdx >= 0 && (
        <View style={styles.tracker}>
          {STATUS_STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <View style={styles.stepWrapper}>
                <View
                  style={[
                    styles.stepDot,
                    i <= statusIdx ? styles.stepDotActive : styles.stepDotInactive,
                  ]}
                >
                  {i <= statusIdx && <Text style={styles.stepCheckmark}>✓</Text>}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    i <= statusIdx ? styles.stepLabelActive : styles.stepLabelInactive,
                  ]}
                >
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </Text>
              </View>
              {i < STATUS_STEPS.length - 1 && (
                <View
                  style={[styles.stepLine, i < statusIdx ? styles.stepLineActive : styles.stepLineInactive]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      )}

      {/* Order summary card */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Order ID</Text>
          <Text style={styles.cardValueMono}>#{order.id.slice(0, 8).toUpperCase()}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Status</Text>
          <View style={[styles.badge, { backgroundColor: STATUS_COLORS[order.status] ?? '#6b7280' }]}>
            <Text style={styles.badgeText}>{order.status.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Placed</Text>
          <Text style={styles.cardValue}>
            {new Date(order.placedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </Text>
        </View>
        <View style={[styles.cardRow, styles.cardRowLast]}>
          <Text style={styles.cardLabel}>Total</Text>
          <PriceTag cents={order.totalCents} />
        </View>
      </View>

      {/* Order items */}
      {order.items?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.productTitle}</Text>
                <Text style={styles.itemMeta}>
                  Size {item.size} · {item.color} · Qty {item.quantity}
                </Text>
              </View>
              <PriceTag cents={item.unitPriceCents * item.quantity} />
            </View>
          ))}
        </View>
      )}

      {/* Shipping address */}
      {order.address && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressBox}>
            <Text style={styles.addressLine}>{order.address.line1}</Text>
            {order.address.line2 && (
              <Text style={styles.addressLine}>{order.address.line2}</Text>
            )}
            <Text style={styles.addressLine}>
              {order.address.city}, {order.address.postalCode}
            </Text>
            <Text style={styles.addressLine}>{order.address.country}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f17' },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f17' },
  errorText: { color: '#9ca3af', fontSize: 16 },

  tracker: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  stepWrapper: { alignItems: 'center', width: 56 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotActive: { backgroundColor: '#e94560' },
  stepDotInactive: { backgroundColor: '#2d2d44', borderWidth: 1, borderColor: '#4b5563' },
  stepCheckmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  stepLabel: { fontSize: 9, textAlign: 'center' },
  stepLabelActive: { color: '#d1d5db', fontWeight: '600' },
  stepLabelInactive: { color: '#4b5563' },
  stepLine: { flex: 1, height: 2, marginTop: 14, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#e94560' },
  stepLineInactive: { backgroundColor: '#2d2d44' },

  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d2d44',
    padding: 16,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  cardRowLast: { borderBottomWidth: 0 },
  cardLabel: { color: '#9ca3af', fontSize: 13 },
  cardValue: { color: '#d1d5db', fontSize: 13 },
  cardValueMono: { color: '#fff', fontFamily: 'monospace', fontWeight: '700', fontSize: 13 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  section: { marginBottom: 16 },
  sectionTitle: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2d2d44',
    gap: 8,
  },
  itemInfo: { flex: 1 },
  itemTitle: { color: '#d1d5db', fontWeight: '600', fontSize: 14, marginBottom: 4 },
  itemMeta: { color: '#9ca3af', fontSize: 12 },

  addressBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  addressLine: { color: '#d1d5db', fontSize: 14, lineHeight: 22 },
});
