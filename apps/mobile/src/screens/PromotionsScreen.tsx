import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Clipboard,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

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

const PROMO_PALETTES = [
  '#e94560',
  '#3b82f6',
  '#10b981',
  '#8957e5',
  '#f0b72f',
  '#ec4899',
];

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

function formatDiscount(type: string, value: number): string {
  if (type === 'percentage') return `${value}% OFF`;
  return `$${(value / 100).toFixed(0)} OFF`;
}

function timeRemaining(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d remaining`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h remaining`;
  const minutes = Math.floor(diff / 60000);
  return `${minutes}m remaining`;
}

function isExpiringSoon(endsAt: string): boolean {
  const diff = new Date(endsAt).getTime() - Date.now();
  return diff > 0 && diff < 86400000 * 3;
}

function PromotionCard({ promo, index }: { promo: Promotion; index: number }) {
  const color = PROMO_PALETTES[index % PROMO_PALETTES.length];
  const expiringSoon = isExpiringSoon(promo.endsAt);
  const remaining = timeRemaining(promo.endsAt);

  return (
    <View style={[styles.card, { borderColor: color + '50' }]}>
      <View style={[styles.cardHeader, { backgroundColor: color }]}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{formatDiscount(promo.discountType, promo.discountValue)}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.promoName}>{promo.name}</Text>
          {promo.description && (
            <Text style={styles.promoDesc} numberOfLines={1}>{promo.description}</Text>
          )}
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          {promo.minimumOrderAmount && promo.minimumOrderAmount > 0 && (
            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>
                Min. order ${(promo.minimumOrderAmount / 100).toFixed(0)}
              </Text>
            </View>
          )}
          {promo.usageLimit && (
            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>
                {promo.usageLimit - promo.usageCount} left
              </Text>
            </View>
          )}
          <View style={[styles.timePill, expiringSoon && styles.timePillUrgent]}>
            <Text style={[styles.timePillText, expiringSoon && styles.timePillTextUrgent]}>
              ⏱ {remaining}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.claimBtn, { backgroundColor: color }]}
          activeOpacity={0.85}
          onPress={() => Alert.alert('Promotion Applied', `This promotion will be automatically applied at checkout when eligible.`)}
        >
          <Text style={styles.claimBtnText}>Claim Offer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function PromotionsScreen() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPromotions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/promotions/active`);
      if (res.ok) {
        const data = await res.json();
        setPromotions(Array.isArray(data) ? data : []);
      }
    } catch {
      setPromotions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPromotions();
    }, [fetchPromotions])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  const percentOffs = promotions.filter((p) => p.discountType === 'percentage');
  const fixedOffs = promotions.filter((p) => p.discountType === 'fixed');
  const maxDiscount = percentOffs.length > 0
    ? Math.max(...percentOffs.map((p) => p.discountValue))
    : 0;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={promotions}
      keyExtractor={(p) => p.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchPromotions(true)}
          tintColor={COLORS.accent}
        />
      }
      ListHeaderComponent={
        <>
          <View style={styles.hero}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🏷️ Active Offers</Text>
            </View>
            <Text style={styles.heroTitle}>Promotions</Text>
            <Text style={styles.heroSub}>
              Current deals and discounts automatically applied at checkout
            </Text>
          </View>

          {promotions.length > 0 && (
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{promotions.length}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={[styles.statNum, { color: COLORS.green }]}>{maxDiscount > 0 ? `${maxDiscount}%` : '—'}</Text>
                <Text style={styles.statLabel}>Max % Off</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={[styles.statNum, { color: COLORS.yellow }]}>{fixedOffs.length}</Text>
                <Text style={styles.statLabel}>Fixed $ Off</Text>
              </View>
            </View>
          )}
        </>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏷️</Text>
          <Text style={styles.emptyTitle}>No Active Promotions</Text>
          <Text style={styles.emptyText}>Check back later for new deals and discounts!</Text>
        </View>
      }
      renderItem={({ item, index }) => <PromotionCard promo={item} index={index} />}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    />
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
    backgroundColor: COLORS.purple + '25',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.purple + '50',
  },
  heroBadgeText: { color: COLORS.purple, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
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
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  discountBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  discountText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  headerRight: { flex: 1 },
  promoName: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 2 },
  promoDesc: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },

  cardBody: { padding: 14 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },

  infoPill: {
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoPillText: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },

  timePill: {
    backgroundColor: COLORS.blue + '20',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.blue + '40',
  },
  timePillUrgent: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent + '40' },
  timePillText: { color: COLORS.blue, fontSize: 11, fontWeight: '600' },
  timePillTextUrgent: { color: COLORS.accent },

  claimBtn: {
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  claimBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32, gap: 10 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
});
