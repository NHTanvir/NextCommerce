import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
  green: '#3fb950',
  blue: '#58a6ff',
  yellow: '#f0b72f',
  purple: '#8957e5',
};

const TYPE_COLOR: Record<string, string> = {
  order_placed: COLORS.blue,
  order_shipped: COLORS.purple,
  order_delivered: COLORS.green,
  order_cancelled: COLORS.accent,
  price_drop: COLORS.yellow,
  back_in_stock: COLORS.green,
  promo: '#22c55e',
  review_reply: COLORS.blue,
  loyalty_points: COLORS.yellow,
  system: COLORS.muted,
  referral: '#ec4899',
};

const TYPE_ICON: Record<string, string> = {
  order_placed: '🛍️',
  order_shipped: '🚚',
  order_delivered: '✅',
  order_cancelled: '❌',
  price_drop: '📉',
  back_in_stock: '🔔',
  promo: '🏷️',
  review_reply: '💬',
  loyalty_points: '⭐',
  system: '⚙️',
  referral: '👥',
};

function getTypeColor(type: string): string {
  return TYPE_COLOR[type] ?? COLORS.muted;
}

function getTypeIcon(type: string): string {
  return TYPE_ICON[type] ?? '🔔';
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupByDate(notifications: Notification[]): { date: string; items: Notification[] }[] {
  const groups: Record<string, Notification[]> = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const n of notifications) {
    const d = new Date(n.createdAt).toDateString();
    const label = d === today ? 'Today' : d === yesterday ? 'Yesterday' : new Date(n.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }

  return Object.entries(groups).map(([date, items]) => ({ date, items }));
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('nc_token');
      if (!token) {
        setNotifications([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      const [notifRes, countRes] = await Promise.all([
        fetch(`${API_URL}/notifications?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(Array.isArray(data) ? data : data.data ?? []);
      }
      if (countRes.ok) {
        const countData = await countRes.json();
        setUnreadCount(countData.count ?? 0);
      }
    } catch {
      // stay with existing data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifications();
    }, [fetchNotifications])
  );

  const markRead = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('nc_token');
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  const markAllRead = async () => {
    try {
      const token = await AsyncStorage.getItem('nc_token');
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('nc_token');
      await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const clearAll = () => {
    Alert.alert('Clear All Notifications', 'This will delete all your notifications. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          const token = await AsyncStorage.getItem('nc_token');
          try {
            await fetch(`${API_URL}/notifications`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token ?? ''}` },
            });
          } catch {
            // best effort
          }
          setNotifications([]);
          setUnreadCount(0);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  const grouped = groupByDate(notifications);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>
          Notifications{unreadCount > 0 ? ` · ${unreadCount} unread` : ''}
        </Text>
        <View style={styles.topActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead} style={styles.topBtn}>
              <Text style={styles.topBtnText}>Mark all read</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearAll} style={styles.topBtn}>
              <Text style={[styles.topBtnText, { color: COLORS.accent }]}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyText}>No notifications yet. We'll let you know when something needs your attention.</Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(g) => g.date}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              tintColor={COLORS.accent}
            />
          }
          renderItem={({ item: group }) => (
            <View>
              <View style={styles.dateSeparator}>
                <View style={styles.dateLine} />
                <Text style={styles.dateLabel}>{group.date}</Text>
                <View style={styles.dateLine} />
              </View>
              {group.items.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.card, !notif.read && styles.cardUnread]}
                  activeOpacity={0.75}
                  onPress={() => !notif.read && markRead(notif.id)}
                  onLongPress={() => {
                    Alert.alert('Remove', 'Delete this notification?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteNotification(notif.id) },
                    ]);
                  }}
                >
                  <View
                    style={[
                      styles.iconBadge,
                      { backgroundColor: getTypeColor(notif.type) + '20' },
                    ]}
                  >
                    <Text style={styles.iconText}>{getTypeIcon(notif.type)}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.cardRow}>
                      <Text
                        style={[styles.cardTitle, !notif.read && styles.cardTitleBold]}
                        numberOfLines={1}
                      >
                        {notif.title}
                      </Text>
                      <Text style={styles.timeText}>{formatTime(notif.createdAt)}</Text>
                    </View>
                    <Text style={styles.bodyText} numberOfLines={2}>
                      {notif.body}
                    </Text>
                    <View style={styles.typeBadge}>
                      <View
                        style={[styles.typeDot, { backgroundColor: getTypeColor(notif.type) }]}
                      />
                      <Text style={styles.typeText}>
                        {notif.type.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>
                  {!notif.read && (
                    <View style={[styles.unreadDot, { backgroundColor: getTypeColor(notif.type) }]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#161b22',
  },
  topBarTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  topActions: { flexDirection: 'row', gap: 12 },
  topBtn: { paddingVertical: 2 },
  topBtnText: { fontSize: 13, color: COLORS.blue, fontWeight: '600' },

  list: { paddingBottom: 40 },

  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dateLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dateLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },

  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardUnread: {
    borderColor: COLORS.accent + '40',
    backgroundColor: '#1c2128',
  },

  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: { fontSize: 18 },

  cardBody: { flex: 1 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  cardTitle: { fontSize: 13, color: COLORS.muted, flex: 1, marginRight: 8 },
  cardTitleBold: { color: COLORS.text, fontWeight: '700' },
  timeText: { fontSize: 10, color: COLORS.muted, flexShrink: 0 },
  bodyText: { fontSize: 13, color: COLORS.muted, lineHeight: 18, marginBottom: 6 },

  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typeDot: { width: 5, height: 5, borderRadius: 2.5 },
  typeText: { fontSize: 10, color: COLORS.muted, textTransform: 'capitalize', fontWeight: '600' },

  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, flexShrink: 0 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 10 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
});
