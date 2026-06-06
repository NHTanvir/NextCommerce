import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ShopStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<ShopStackParamList>;

const STORAGE_KEY = 'nc_recently_viewed';
const MAX_ITEMS = 20;

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
};

interface RecentProduct {
  id: string;
  slug: string;
  title: string;
  brand: string;
  basePriceCents: number;
  imageUrl?: string;
  categoryName?: string;
  viewedAt: number;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 1) return `${m}m ago`;
  return 'Just now';
}

export async function trackRecentlyViewed(product: Omit<RecentProduct, 'viewedAt'>) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const existing: RecentProduct[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((p) => p.id !== product.id);
    const updated = [{ ...product, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // silently fail
  }
}

function ProductCard({
  item,
  onPress,
}: {
  item: RecentProduct;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageBox}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <Text style={styles.imagePlaceholder}>👟</Text>
        )}
      </View>
      <View style={styles.cardBody}>
        {item.brand && <Text style={styles.brand} numberOfLines={1}>{item.brand}</Text>}
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {item.categoryName && (
          <Text style={styles.category} numberOfLines={1}>{item.categoryName}</Text>
        )}
        <View style={styles.cardFooter}>
          <Text style={styles.price}>${(item.basePriceCents / 100).toFixed(2)}</Text>
          <Text style={styles.time}>{timeAgo(item.viewedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function RecentlyViewedScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems]),
  );

  const handleClear = () => {
    Alert.alert(
      'Clear History',
      'Remove all recently viewed products?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setItems([]);
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>👁️</Text>
        <Text style={styles.emptyTitle}>No recently viewed products</Text>
        <Text style={styles.emptyDesc}>Products you browse will appear here.</Text>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => navigation.navigate('ProductList')}
        >
          <Text style={styles.browseBtnText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(i) => i.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>Recently Viewed</Text>
            <Text style={styles.sub}>{items.length} product{items.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <ProductCard
          item={item}
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
  },
  heading: { fontSize: 24, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },

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
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { fontSize: 36 },
  cardBody: { padding: 10, gap: 2 },
  brand: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: { fontSize: 13, fontWeight: '600', color: COLORS.text, lineHeight: 17 },
  category: { fontSize: 11, color: COLORS.muted },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: { fontSize: 14, fontWeight: '800', color: COLORS.accent },
  time: { fontSize: 10, color: COLORS.muted },

  empty: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  emptyIcon: { fontSize: 56, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  emptyDesc: { fontSize: 14, color: COLORS.muted, textAlign: 'center' },
  browseBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
