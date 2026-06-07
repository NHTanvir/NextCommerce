import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ShopStackParamList } from '@/navigation/types';
import { fetchBackInStockSubs, removeBackInStockSub, type BackInStockSub } from '@/api/backInStock';

type Nav = NativeStackNavigationProp<ShopStackParamList>;

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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const hours = Math.floor(diff / 3600000);
    if (hours === 0) return 'just now';
    return `${hours}h ago`;
  }
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function VariantChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}: </Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

function SubCard({
  sub,
  onRemove,
  onViewProduct,
}: {
  sub: BackInStockSub;
  onRemove: () => void;
  onViewProduct: () => void;
}) {
  const isBackInStock = (sub.variant?.stockQty ?? 0) > 0;
  const isNotified = sub.notified;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {sub.product?.title ?? 'Unknown Product'}
          </Text>
          <Text style={styles.brandText}>{sub.product?.brand ?? ''}</Text>
        </View>
        <View style={styles.badgeCol}>
          {isBackInStock ? (
            <View style={styles.inStockBadge}>
              <Text style={styles.inStockText}>Back in Stock!</Text>
            </View>
          ) : (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
          {isNotified && (
            <View style={styles.notifiedBadge}>
              <Text style={styles.notifiedText}>✓ Notified</Text>
            </View>
          )}
        </View>
      </View>

      {(sub.variant?.size || sub.variant?.color || sub.variant?.sku) && (
        <View style={styles.variantRow}>
          {sub.variant?.size && <VariantChip label="Size" value={String(sub.variant.size)} />}
          {sub.variant?.color && <VariantChip label="Color" value={sub.variant.color} />}
          {sub.variant?.sku && <VariantChip label="SKU" value={sub.variant.sku} />}
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.timeText}>Subscribed {timeAgo(sub.createdAt)}</Text>
        <View style={styles.actions}>
          {sub.product?.slug && (
            <TouchableOpacity style={styles.viewBtn} onPress={onViewProduct}>
              <Text style={styles.viewBtnText}>View</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function BackInStockScreen() {
  const navigation = useNavigation<Nav>();
  const [subs, setSubs] = useState<BackInStockSub[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBackInStockSubs();
      setSubs(data);
    } catch {
      setSubs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchSubs);

  const handleRemove = (sub: BackInStockSub) => {
    Alert.alert(
      'Remove Subscription',
      `Stop tracking "${sub.product?.title ?? 'this product'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeBackInStockSub(sub.id);
              setSubs((prev) => prev.filter((s) => s.id !== sub.id));
            } catch {
              Alert.alert('Error', 'Failed to remove subscription.');
            }
          },
        },
      ],
    );
  };

  const notifiedCount = subs.filter((s) => s.notified).length;
  const inStockCount = subs.filter((s) => (s.variant?.stockQty ?? 0) > 0).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={subs}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.hero}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>🔔 Restock Alerts</Text>
              </View>
              <Text style={styles.heroTitle}>Back in Stock</Text>
              <Text style={styles.heroSub}>
                We'll notify you when these items are available again
              </Text>
            </View>

            {subs.length > 0 && (
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{subs.length}</Text>
                  <Text style={styles.statLabel}>Watching</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={[styles.statNum, { color: COLORS.green }]}>{inStockCount}</Text>
                  <Text style={styles.statLabel}>In Stock</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={[styles.statNum, { color: COLORS.blue }]}>{notifiedCount}</Text>
                  <Text style={styles.statLabel}>Notified</Text>
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No Active Subscriptions</Text>
            <Text style={styles.emptyText}>
              When an item you want is out of stock, tap "Notify Me" to get alerted when it's back.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <SubCard
            sub={item}
            onRemove={() => handleRemove(item)}
            onViewProduct={() => {
              if (item.product?.slug) {
                navigation.navigate('ProductDetail', { slug: item.product.slug });
              }
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 40 },
  center: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },

  hero: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#161b22',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.green + '25',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.green + '50',
  },
  heroBadgeText: { color: COLORS.green, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5, marginBottom: 4 },
  heroSub: { fontSize: 13, color: COLORS.muted },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.border },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardHeaderLeft: { flex: 1, marginRight: 8 },
  productTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
  brandText: { fontSize: 11, color: COLORS.muted, marginTop: 2, textTransform: 'uppercase', fontWeight: '600' },
  badgeCol: { alignItems: 'flex-end', gap: 4 },
  inStockBadge: {
    backgroundColor: COLORS.green + '20',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.green + '50',
  },
  inStockText: { color: COLORS.green, fontSize: 10, fontWeight: '700' },
  outOfStockBadge: {
    backgroundColor: COLORS.accent + '20',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.accent + '50',
  },
  outOfStockText: { color: COLORS.accent, fontSize: 10, fontWeight: '700' },
  notifiedBadge: {
    backgroundColor: COLORS.blue + '20',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  notifiedText: { color: COLORS.blue, fontSize: 10, fontWeight: '700' },

  variantRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chip: {
    flexDirection: 'row',
    backgroundColor: '#0d1117',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipLabel: { fontSize: 11, color: COLORS.muted },
  chipValue: { fontSize: 11, color: COLORS.text, fontWeight: '600' },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 14,
  },
  timeText: { fontSize: 11, color: COLORS.muted },
  actions: { flexDirection: 'row', gap: 8 },
  viewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.blue + '60',
    backgroundColor: COLORS.blue + '15',
  },
  viewBtnText: { fontSize: 12, color: COLORS.blue, fontWeight: '600' },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  removeBtnText: { fontSize: 12, color: COLORS.muted, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32, gap: 10 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
});
