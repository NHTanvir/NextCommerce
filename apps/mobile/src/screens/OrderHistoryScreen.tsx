import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { fetchOrders } from '../api/orders';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OrderHistory'>;

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  paid: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#ef4444',
  refunded: '#6b7280',
};

export function OrderHistoryScreen() {
  const navigation = useNavigation<Nav>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch {
      Alert.alert('Error', 'Failed to load orders. Please sign in first.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => navigation.navigate('ProductList')}
        >
          <Text style={styles.browseBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
          tintColor="#e94560"
        />
      }
      ListHeaderComponent={
        <Text style={styles.heading}>My Orders ({orders.length})</Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          activeOpacity={0.75}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: STATUS_COLORS[item.status] ?? '#6b7280' },
              ]}
            >
              <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.label}>Placed</Text>
            <Text style={styles.value}>{formatDate(item.placedAt)}</Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.itemCount}>{item.items?.length ?? 0} items</Text>
            <Text style={styles.total}>{formatPrice(item.totalCents)}</Text>
          </View>

          <Text style={styles.viewDetails}>View details →</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f17',
    gap: 12,
  },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  emptySubtitle: { color: '#9ca3af', textAlign: 'center' },
  browseBtn: {
    marginTop: 8,
    backgroundColor: '#e94560',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { padding: 16, backgroundColor: '#0f0f17', flexGrow: 1 },
  heading: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: { color: '#fff', fontWeight: '700', fontSize: 15, fontFamily: 'monospace' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  cardBody: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  label: { color: '#9ca3af', fontSize: 13 },
  value: { color: '#d1d5db', fontSize: 13 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2d2d44',
    paddingTop: 10,
    marginBottom: 8,
  },
  itemCount: { color: '#9ca3af', fontSize: 13 },
  total: { color: '#e94560', fontWeight: '700', fontSize: 17 },
  viewDetails: { color: '#6b7280', fontSize: 12, textAlign: 'right' },
});
