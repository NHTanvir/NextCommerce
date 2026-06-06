import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ShopStackParamList } from '@/navigation/types';
import { fetchDeals as apiFetchDeals } from '@/api/catalog';

type Nav = NativeStackNavigationProp<ShopStackParamList>;

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
  success: '#3fb950',
  warning: '#f59e0b',
};

const DISCOUNT_TIERS = [
  { label: 'All Deals', value: 0 },
  { label: '10%+ Off', value: 10 },
  { label: '20%+ Off', value: 20 },
  { label: '30%+ Off', value: 30 },
  { label: '50%+ Off', value: 50 },
];

interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  brand: string;
  basePriceCents: number;
  salePriceCents?: number;
  images?: Array<{ url: string }>;
  categoryName?: string;
}

function getDiscountPct(base: number, sale?: number): number {
  if (!sale || sale >= base) return 0;
  return Math.round(((base - sale) / base) * 100);
}

function DiscountBadge({ pct }: { pct: number }) {
  if (pct <= 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>-{pct}%</Text>
    </View>
  );
}

function DealCard({ product, onPress }: { product: ProductSummary; onPress: () => void }) {
  const pct = getDiscountPct(product.basePriceCents, product.salePriceCents);
  const salePrice = product.salePriceCents ?? product.basePriceCents;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardImageBox}>
        {product.images?.[0]?.url ? (
          <Image source={{ uri: product.images[0].url }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <Text style={styles.cardImagePlaceholder}>🏷️</Text>
        )}
        <DiscountBadge pct={pct} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardBrand} numberOfLines={1}>{product.brand}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>{product.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.salePrice}>${(salePrice / 100).toFixed(2)}</Text>
          {pct > 0 && (
            <Text style={styles.basePrice}>${(product.basePriceCents / 100).toFixed(2)}</Text>
          )}
        </View>
        {pct > 0 && (
          <Text style={styles.savings}>
            Save ${((product.basePriceCents - salePrice) / 100).toFixed(2)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function DealsScreen() {
  const navigation = useNavigation<Nav>();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [minDiscount, setMinDiscount] = useState(0);

  const fetchDeals = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await apiFetchDeals(60);
      setProducts(result.data ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, []);

  const filtered = useMemo(() => {
    if (minDiscount === 0) return products;
    return products.filter((p) => getDiscountPct(p.basePriceCents, p.salePriceCents) >= minDiscount);
  }, [products, minDiscount]);

  const totalSavings = useMemo(
    () => filtered.reduce((s, p) => {
      const sale = p.salePriceCents ?? p.basePriceCents;
      return s + Math.max(0, p.basePriceCents - sale);
    }, 0),
    [filtered],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
        <Text style={styles.loadingText}>Finding deals…</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={filtered}
      keyExtractor={(p) => p.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchDeals(true)}
          tintColor={COLORS.accent}
        />
      }
      ListHeaderComponent={
        <>
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>🔥</Text>
            <Text style={styles.heroTitle}>Today's Deals</Text>
            <Text style={styles.heroSub}>Limited time savings on top products</Text>
          </View>

          {/* Stats bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{filtered.length}</Text>
              <Text style={styles.statLabel}>Deals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: COLORS.success }]}>
                ${(totalSavings / 100).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Total Savings</Text>
            </View>
          </View>

          {/* Discount tier filter */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={DISCOUNT_TIERS}
            keyExtractor={(t) => String(t.value)}
            contentContainerStyle={styles.tierRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.tierBtn, minDiscount === item.value && styles.tierBtnActive]}
                onPress={() => setMinDiscount(item.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tierText, minDiscount === item.value && styles.tierTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />

          {filtered.length === 0 && minDiscount > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => setMinDiscount(0)}
            >
              <Text style={styles.clearBtnText}>Show All Deals</Text>
            </TouchableOpacity>
          )}
        </>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏷️</Text>
          <Text style={styles.emptyText}>No deals match this filter</Text>
        </View>
      }
      renderItem={({ item }) => (
        <DealCard
          product={item}
          onPress={() => navigation.navigate('ProductDetail', { slug: item.slug })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 40 },
  center: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: COLORS.muted, fontSize: 14 },

  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#161b22',
  },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: COLORS.muted, marginTop: 4 },

  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: { alignItems: 'center', gap: 2 },
  statNum: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.border },

  tierRow: { gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  tierBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  tierBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tierText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  tierTextActive: { color: '#fff' },

  clearBtn: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearBtnText: { color: COLORS.accent, fontWeight: '600', fontSize: 14 },

  row: { justifyContent: 'space-between', gap: 10, paddingHorizontal: 16, marginBottom: 0 },

  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 10,
  },
  cardImageBox: {
    aspectRatio: 1,
    backgroundColor: '#161b22',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardImage: { width: '100%', height: '100%' },
  cardImagePlaceholder: { fontSize: 40 },

  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  cardBody: { padding: 10, gap: 2 },
  cardBrand: { fontSize: 10, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: COLORS.text, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  salePrice: { fontSize: 15, fontWeight: '900', color: COLORS.accent },
  basePrice: { fontSize: 12, color: COLORS.muted, textDecorationLine: 'line-through' },
  savings: { fontSize: 11, color: COLORS.success, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, color: COLORS.muted },
});
