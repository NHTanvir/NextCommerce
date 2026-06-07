import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ShopStackParamList } from '@/navigation/types';
import { fetchBundles as apiFetchBundles, type Bundle } from '@/api/bundles';

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
};

const BUNDLE_PALETTES = [
  { bg: '#e94560', light: '#e9456020' },
  { bg: '#3b82f6', light: '#3b82f620' },
  { bg: '#10b981', light: '#10b98120' },
  { bg: '#8957e5', light: '#8957e520' },
  { bg: '#f0b72f', light: '#f0b72f20' },
  { bg: '#06b6d4', light: '#06b6d420' },
];

type BundleDto = Bundle;

function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d left`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h left`;
  return 'Ending soon';
}

function BundleCard({ bundle, index }: { bundle: BundleDto; index: number }) {
  const palette = BUNDLE_PALETTES[index % BUNDLE_PALETTES.length];
  const isExpiringSoon = bundle.endsAt
    ? new Date(bundle.endsAt).getTime() - Date.now() < 86400000 * 3
    : false;

  return (
    <View style={[styles.card, { borderColor: palette.bg + '40' }]}>
      <View style={[styles.cardBanner, { backgroundColor: palette.bg }]}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{bundle.discountPercent}%</Text>
          <Text style={styles.discountOff}>OFF</Text>
        </View>
        <View style={styles.bannerRight}>
          <Text style={styles.bundleName}>{bundle.name}</Text>
          <Text style={styles.productCount}>
            {bundle.productIds.length} product{bundle.productIds.length !== 1 ? 's' : ''} included
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        {bundle.description && (
          <Text style={styles.description} numberOfLines={2}>{bundle.description}</Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.savingsPill}>
            <Text style={styles.savingsPillText}>Save {bundle.discountPercent}% on bundle</Text>
          </View>
          {bundle.endsAt && (
            <View style={[styles.timePill, isExpiringSoon && styles.timePillUrgent]}>
              <Text style={[styles.timePillText, isExpiringSoon && styles.timePillTextUrgent]}>
                ⏱ {timeUntil(bundle.endsAt)}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.shopBtn, { backgroundColor: palette.bg }]}
          activeOpacity={0.85}
        >
          <Text style={styles.shopBtnText}>Shop Bundle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function BundlesScreen() {
  const navigation = useNavigation<Nav>();
  const [bundles, setBundles] = useState<BundleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBundles = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await apiFetchBundles();
      setBundles(data);
    } catch {
      setBundles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchBundles();
    }, [fetchBundles])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  const totalSavingsCount = bundles.length;
  const maxDiscount = bundles.length > 0
    ? Math.max(...bundles.map((b) => b.discountPercent))
    : 0;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={bundles}
      keyExtractor={(b) => b.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchBundles(true)}
          tintColor={COLORS.accent}
        />
      }
      ListHeaderComponent={
        <>
          <View style={styles.hero}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🎁 Bundle & Save</Text>
            </View>
            <Text style={styles.heroTitle}>Product Bundles</Text>
            <Text style={styles.heroSub}>
              Buy curated sets and save big — up to {maxDiscount}% off
            </Text>
          </View>

          {bundles.length > 0 && (
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{totalSavingsCount}</Text>
                <Text style={styles.statLabel}>Active Bundles</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={[styles.statNum, { color: COLORS.green }]}>{maxDiscount}%</Text>
                <Text style={styles.statLabel}>Max Discount</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={[styles.statNum, { color: COLORS.yellow }]}>
                  {bundles.filter((b) => b.endsAt).length}
                </Text>
                <Text style={styles.statLabel}>Limited Time</Text>
              </View>
            </View>
          )}
        </>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎁</Text>
          <Text style={styles.emptyTitle}>No Bundles Available</Text>
          <Text style={styles.emptyText}>Check back soon for exciting bundle deals!</Text>
        </View>
      }
      renderItem={({ item, index }) => <BundleCard bundle={item} index={index} />}
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
    backgroundColor: COLORS.yellow + '25',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.yellow + '50',
  },
  heroBadgeText: { color: COLORS.yellow, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
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
  cardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  discountBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
  },
  discountText: { fontSize: 26, fontWeight: '900', color: '#fff', lineHeight: 30 },
  discountOff: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
  bannerRight: { flex: 1 },
  bundleName: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 2 },
  productCount: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  cardBody: { padding: 14 },
  description: { fontSize: 13, color: COLORS.muted, lineHeight: 18, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },

  savingsPill: {
    backgroundColor: COLORS.green + '20',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.green + '40',
  },
  savingsPillText: { color: COLORS.green, fontSize: 11, fontWeight: '600' },

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

  shopBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  shopBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32, gap: 10 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
});
