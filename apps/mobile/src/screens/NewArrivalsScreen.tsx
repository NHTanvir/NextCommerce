import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ShopStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<ShopStackParamList>;

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
  blue: '#58a6ff',
};

interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  basePriceCents: number;
  salePriceCents?: number;
  images?: Array<{ url: string }>;
  categoryName?: string;
  createdAt?: string;
}

interface Category {
  id: string;
  name: string;
}

function isNew(createdAt?: string): boolean {
  if (!createdAt) return false;
  const age = Date.now() - new Date(createdAt).getTime();
  return age < 7 * 24 * 60 * 60 * 1000;
}

function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const fresh = isNew(product.createdAt);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageBox}>
        {product.images?.[0]?.url ? (
          <Image source={{ uri: product.images[0].url }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.imagePlaceholder}>👟</Text>
        )}
        {fresh && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.price}>${(product.basePriceCents / 100).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NewArrivalsScreen() {
  const navigation = useNavigation<Nav>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = useCallback(async (p: number, refresh = false) => {
    if (refresh) setRefreshing(true);
    else if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const catParam = selectedCat ? `&categoryId=${selectedCat}` : '';
      const res = await fetch(`${API_URL}/catalog/products?limit=16&page=${p}&sort=newest${catParam}`);
      const data = await res.json();
      const items: Product[] = data.data ?? [];
      setProducts((prev) => (p === 1 || refresh ? items : [...prev, ...items]));
      setTotalPages(data.totalPages ?? 1);
      setPage(p);
    } catch {
      if (p === 1 || refresh) setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [selectedCat]);

  useEffect(() => {
    fetch(`${API_URL}/catalog/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [selectedCat]);

  const loadMore = () => {
    if (!loadingMore && page < totalPages) {
      fetchProducts(page + 1);
    }
  };

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
          onRefresh={() => fetchProducts(1, true)}
          tintColor={COLORS.accent}
        />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={
        <>
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Just Dropped</Text>
            </View>
            <Text style={styles.heroTitle}>New Arrivals</Text>
            <Text style={styles.heroSub}>Fresh additions from top brands</Text>
          </View>

          {/* Category filter */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: '', name: 'All' }, ...categories]}
            keyExtractor={(c) => c.id}
            contentContainerStyle={styles.catRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.catBtn, selectedCat === item.id && styles.catBtnActive]}
                onPress={() => setSelectedCat(item.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catText, selectedCat === item.id && styles.catTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </>
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator color={COLORS.accent} size="small" />
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>👟</Text>
          <Text style={styles.emptyText}>No new arrivals in this category yet.</Text>
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
    backgroundColor: COLORS.accent + '25',
    borderWidth: 1,
    borderColor: COLORS.accent + '50',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  heroBadgeText: { color: COLORS.accent, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5, marginBottom: 4 },
  heroSub: { fontSize: 14, color: COLORS.muted },

  catRow: { gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  catBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  catText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  catTextActive: { color: '#fff' },

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
  imageBox: {
    aspectRatio: 1,
    backgroundColor: '#161b22',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { fontSize: 40 },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.blue,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  newBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  cardBody: { padding: 10, gap: 2 },
  brand: { fontSize: 10, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 13, fontWeight: '600', color: COLORS.text, lineHeight: 18 },
  price: { fontSize: 15, fontWeight: '900', color: COLORS.accent, marginTop: 4 },

  footerLoader: { padding: 20, alignItems: 'center' },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, color: COLORS.muted, textAlign: 'center' },
});
