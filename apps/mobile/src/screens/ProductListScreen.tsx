import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProductDto } from '@nextcommerce/shared';
import { fetchProducts } from '@/api/catalog';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

const COLORS = {
  bg: '#0d1117',
  card: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
};

function ProductItem({ item, onPress }: { item: ProductDto; onPress: () => void }) {
  const minPrice = item.variants?.length
    ? Math.min(...item.variants.map((v) => v.priceCents))
    : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imgBox}>
        {item.images?.[0]?.url ? (
          <Image source={{ uri: item.images[0].url }} style={styles.img} resizeMode="cover" />
        ) : (
          <Text style={styles.imgPlaceholder}>👟</Text>
        )}
      </View>
      <View style={styles.cardBody}>
        {item.brand && <Text style={styles.brand}>{item.brand.toUpperCase()}</Text>}
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>${(minPrice / 100).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function ProductListScreen() {
  const nav = useNavigation<Nav>();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  async function loadProducts(p: number, q: string, reset?: boolean) {
    try {
      const res = await fetchProducts({ page: p, limit: 20, search: q || undefined });
      setProducts((prev) => (reset ? res.items : [...prev, ...res.items]));
      setHasMore(p < res.totalPages);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    setPage(1);
    loadProducts(1, search, true);
  }, [search]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadProducts(1, search, true);
  }, [search]);

  function loadMore() {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    loadProducts(next, search);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>Next<Text style={styles.logoAccent}>Commerce</Text></Text>
      </View>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search shoes..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading && products.length === 0 ? (
        <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <ProductItem
              item={item}
              onPress={() => nav.navigate('ProductDetail', { slug: item.slug })}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
          ListFooterComponent={hasMore ? <ActivityIndicator color={COLORS.accent} style={{ padding: 16 }} /> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoText: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  logoAccent: { color: COLORS.accent },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: COLORS.text, paddingVertical: 10, fontSize: 15 },
  list: { padding: 8 },
  row: { gap: 8 },
  card: {
    flex: 1,
    margin: 4,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  imgBox: {
    aspectRatio: 1,
    backgroundColor: '#161b22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: { fontSize: 40 },
  cardBody: { padding: 10, gap: 4 },
  brand: { fontSize: 10, fontWeight: '700', color: COLORS.muted, letterSpacing: 1 },
  title: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  price: { fontSize: 15, fontWeight: '800', color: COLORS.accent },
});
