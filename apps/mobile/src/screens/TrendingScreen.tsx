import React, { useEffect, useState, useCallback } from 'react';
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

type Nav = NativeStackNavigationProp<ShopStackParamList>;

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  brand: string;
  basePriceCents: number;
  images?: Array<{ url: string }>;
  categoryName?: string;
}

const TRENDING_CATEGORIES = ['All', 'Running', 'Basketball', 'Lifestyle', 'Training'];

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
};

function ProductCard({ product, onPress }: { product: ProductSummary; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardImageBox}>
        {product.images?.[0]?.url ? (
          <Image source={{ uri: product.images[0].url }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <Text style={styles.cardImagePlaceholder}>👟</Text>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardBrand} numberOfLines={1}>{product.brand}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.cardPrice}>${(product.basePriceCents / 100).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TrendingScreen() {
  const navigation = useNavigation<Nav>();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchTrending = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    try {
      const cat = activeCategory !== 'All' ? `&category=${encodeURIComponent(activeCategory)}` : '';
      const res = await fetch(`${API_URL}/catalog/products?limit=20&sort=newest${cat}`);
      const data = await res.json();
      setProducts(data.data ?? data ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    setLoading(true);
    fetchTrending();
  }, [activeCategory]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={products}
      keyExtractor={(p) => p.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchTrending(true)}
          tintColor={COLORS.accent}
        />
      }
      ListHeaderComponent={
        <>
          <Text style={styles.heading}>Trending Now</Text>
          <Text style={styles.sub}>What shoppers are loving this week</Text>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={TRENDING_CATEGORIES}
            keyExtractor={(c) => c}
            contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.chip, activeCategory === item && styles.chipActive]}
                onPress={() => setActiveCategory(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, activeCategory === item && styles.chipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No trending products found</Text>
        </View>
      }
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={() => navigation.navigate('ProductDetail', { slug: item.slug })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },

  heading: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  sub: { fontSize: 14, color: COLORS.muted, marginBottom: 16 },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  row: { justifyContent: 'space-between', gap: 10 },

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
  },
  cardImage: { width: '100%', height: '100%' },
  cardImagePlaceholder: { fontSize: 40 },

  cardBody: { padding: 10, gap: 2 },
  cardBrand: { fontSize: 10, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: COLORS.text, lineHeight: 18 },
  cardPrice: { fontSize: 15, fontWeight: '800', color: COLORS.accent, marginTop: 4 },

  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, color: COLORS.muted },
});
