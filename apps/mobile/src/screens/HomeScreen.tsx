import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProductDto } from '@nextcommerce/shared';
import { fetchProducts } from '@/api/catalog';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - 48) / 2;

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
  accent2: '#58a6ff',
};

const BANNERS = [
  { label: 'Summer Sale', sub: 'Up to 50% off selected styles', color: '#e94560' },
  { label: 'New Arrivals', sub: 'Fresh drops every week', color: '#58a6ff' },
  { label: 'Free Shipping', sub: 'On orders over $75', color: '#3fb950' },
];

const CATEGORIES = [
  { name: 'Sneakers', emoji: '👟' },
  { name: 'Running', emoji: '🏃' },
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Lifestyle', emoji: '✨' },
  { name: 'Training', emoji: '💪' },
  { name: 'Outdoor', emoji: '🏔️' },
];

function HeroBanner() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const banner = BANNERS[active];

  return (
    <View style={[styles.heroBanner, { borderColor: banner.color + '40' }]}>
      <View style={[styles.heroAccent, { backgroundColor: banner.color }]} />
      <Text style={[styles.heroLabel, { color: banner.color }]}>{banner.label}</Text>
      <Text style={styles.heroSub}>{banner.sub}</Text>
      <View style={styles.heroDots}>
        {BANNERS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.heroDot,
              i === active && { backgroundColor: banner.color, width: 16 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function ProductCard({
  item,
  onPress,
}: {
  item: ProductDto;
  onPress: () => void;
}) {
  const price = item.variants?.length
    ? Math.min(...item.variants.map((v) => v.priceCents))
    : item.basePriceCents ?? 0;

  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.productImg}>
        {item.images?.[0]?.url ? (
          <Image
            source={{ uri: item.images[0].url }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.productEmoji}>👟</Text>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productBrand} numberOfLines={1}>{item.brand}</Text>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productPrice}>${(price / 100).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [trending, setTrending] = useState<ProductDto[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [t, n] = await Promise.all([
        fetchProducts({ limit: 6, page: 1 }),
        fetchProducts({ limit: 6, page: 2 }),
      ]);
      setTrending(t.data ?? []);
      setNewArrivals(n.data ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const goToProduct = (slug: string) =>
    navigation.navigate('ProductDetail', { slug });

  const goToList = () => navigation.navigate('ProductList');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.accent}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreet}>Welcome to</Text>
          <Text style={styles.headerBrand}>NextCommerce</Text>
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Hero banner */}
      <HeroBanner />

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.name}
              style={styles.categoryChip}
              onPress={goToList}
              activeOpacity={0.75}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Trending */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          <TouchableOpacity onPress={goToList}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 24 }} />
        ) : (
          <View style={styles.productGrid}>
            {trending.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onPress={() => goToProduct(item.slug)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Promo strip */}
      <View style={styles.promoStrip}>
        <View style={styles.promoItem}>
          <Text style={styles.promoEmoji}>🚚</Text>
          <Text style={styles.promoText}>Free shipping over $75</Text>
        </View>
        <View style={styles.promoItem}>
          <Text style={styles.promoEmoji}>↩️</Text>
          <Text style={styles.promoText}>30-day returns</Text>
        </View>
        <View style={styles.promoItem}>
          <Text style={styles.promoEmoji}>🔒</Text>
          <Text style={styles.promoText}>Secure checkout</Text>
        </View>
      </View>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Arrivals</Text>
            <TouchableOpacity onPress={goToList}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productGrid}>
            {newArrivals.slice(0, 4).map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onPress={() => goToProduct(item.slug)}
              />
            ))}
          </View>
        </View>
      )}

      {/* CTA */}
      <TouchableOpacity style={styles.ctaBanner} onPress={goToList} activeOpacity={0.85}>
        <Text style={styles.ctaTitle}>Shop All Products</Text>
        <Text style={styles.ctaSub}>Browse our full collection →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerGreet: {
    fontSize: 13,
    color: COLORS.muted,
  },
  headerBrand: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: 18,
  },
  heroBanner: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    padding: 24,
    overflow: 'hidden',
    minHeight: 120,
    justifyContent: 'center',
  },
  heroAccent: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.15,
  },
  heroLabel: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 14,
    color: COLORS.muted,
  },
  heroDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.accent,
  },
  categoriesRow: {
    gap: 10,
    paddingBottom: 4,
  },
  categoryChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 4,
    minWidth: 72,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryName: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: CARD_W,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: CARD_W,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productEmoji: {
    fontSize: 48,
  },
  productInfo: {
    padding: 10,
  },
  productBrand: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  promoStrip: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    justifyContent: 'space-around',
  },
  promoItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  promoEmoji: {
    fontSize: 20,
  },
  promoText: {
    fontSize: 10,
    color: COLORS.muted,
    textAlign: 'center',
    fontWeight: '500',
  },
  ctaBanner: {
    margin: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  ctaSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
});
