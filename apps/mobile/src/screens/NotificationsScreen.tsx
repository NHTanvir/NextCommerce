import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'promo' | 'system';
  read: boolean;
  createdAt: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Order Shipped', body: 'Your order #ABC123 has been shipped via FedEx.', type: 'order', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', title: '20% Off Sale', body: 'Exclusive weekend sale — use code SAVE20 at checkout!', type: 'promo', read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', title: 'Order Delivered', body: 'Your order #XYZ789 was delivered. Leave a review!', type: 'order', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '4', title: 'New Arrivals', body: 'Check out the latest Air Max collection — just dropped.', type: 'promo', read: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: '5', title: 'Password Changed', body: 'Your account password was updated successfully.', type: 'system', read: true, createdAt: new Date(Date.now() - 432000000).toISOString() },
];

const TYPE_COLOR: Record<string, string> = {
  order: '#e94560',
  promo: '#22c55e',
  system: '#64748b',
};

const TYPE_ICON: Record<string, string> = {
  order: '📦',
  promo: '🏷️',
  system: '⚙️',
};

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // In production this would fetch from API
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    Alert.alert('Clear Notifications', 'Remove all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setNotifications([]) },
    ]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      activeOpacity={0.75}
      onPress={() => markRead(item.id)}
    >
      <View style={[styles.iconBadge, { backgroundColor: TYPE_COLOR[item.type] + '22' }]}>
        <Text style={styles.icon}>{TYPE_ICON[item.type]}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>{item.title}</Text>
          <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
      </View>
      {!item.read && <View style={[styles.dot, { backgroundColor: TYPE_COLOR[item.type] }]} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </Text>
        <View style={styles.actions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead}>
              <Text style={styles.action}>Mark all read</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearAll}>
              <Text style={[styles.action, { color: '#e94560' }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e94560" />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#f8fafc', letterSpacing: -0.5 },
  actions: { flexDirection: 'row', gap: 12 },
  action: { fontSize: 13, color: '#e94560', fontWeight: '600' },
  list: { padding: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#1e293b',
  },
  cardUnread: { backgroundColor: '#1e2d3d' },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: { fontSize: 18 },
  content: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#94a3b8', flex: 1, marginRight: 8 },
  cardTitleUnread: { color: '#f8fafc' },
  body: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  time: { fontSize: 11, color: '#475569', flexShrink: 0 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, flexShrink: 0 },
  separator: { height: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#475569' },
});
