import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
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

const ALL_FILTER = 'all';

export function OrderHistoryScreen() {
  const navigation = useNavigation<Nav>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER);

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

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const o of orders) {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    }
    return counts;
  }, [orders]);

  const availableStatuses = useMemo(() => {
    return Object.keys(STATUS_COLORS).filter((s) => (statusCounts[s] ?? 0) > 0);
  }, [statusCounts]);

  const filtered = useMemo(() => {
    if (activeFilter === ALL_FILTER) return orders;
    return orders.filter((o) => o.status === activeFilter);
  }, [orders, activeFilter]);

  const totalSpent = useMemo(
    () => filtered.reduce((s, o) => s + (o.totalCents ?? 0), 0),
    [filtered],
  );

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
    <View style={styles.container}>
      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{orders.length}</Text>
          <Text style={styles.summaryLabel}>Total Orders</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{formatPrice(totalSpent)}</Text>
          <Text style={styles.summaryLabel}>
            {activeFilter === ALL_FILTER ? 'Total Spent' : `${activeFilter} Total`}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{filtered.length}</Text>
          <Text style={styles.summaryLabel}>Showing</Text>
        </View>
      </View>

      {/* Status filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <TouchableOpacity
          style={[styles.chip, activeFilter === ALL_FILTER && styles.chipActive]}
          onPress={() => setActiveFilter(ALL_FILTER)}
        >
          <Text style={[styles.chipText, activeFilter === ALL_FILTER && styles.chipTextActive]}>
            All ({orders.length})
          </Text>
        </TouchableOpacity>
        {availableStatuses.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.chip,
              activeFilter === status && { backgroundColor: STATUS_COLORS[status] + '33' },
              activeFilter === status && { borderColor: STATUS_COLORS[status] },
            ]}
            onPress={() => setActiveFilter(status)}
          >
            <View
              style={[styles.chipDot, { backgroundColor: STATUS_COLORS[status] }]}
            />
            <Text
              style={[
                styles.chipText,
                activeFilter === status && { color: STATUS_COLORS[status] },
              ]}
            >
              {status} ({statusCounts[status] ?? 0})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor="#e94560"
          />
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
        ListEmptyComponent={
          <View style={styles.filterEmpty}>
            <Text style={styles.filterEmptyText}>
              No {activeFilter} orders found.
            </Text>
            <TouchableOpacity onPress={() => setActiveFilter(ALL_FILTER)}>
              <Text style={styles.clearFilter}>Show all orders</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f17' },
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

  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { color: '#fff', fontWeight: '700', fontSize: 16 },
  summaryLabel: { color: '#9ca3af', fontSize: 11, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: '#2d2d44', marginVertical: 4 },

  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#2d2d44',
    backgroundColor: '#1a1a2e',
  },
  chipActive: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { color: '#9ca3af', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  chipTextActive: { color: '#fff' },

  list: { padding: 16, flexGrow: 1 },
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
  filterEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  filterEmptyText: { color: '#9ca3af', fontSize: 15 },
  clearFilter: { color: '#e94560', fontSize: 14, fontWeight: '600' },
});
