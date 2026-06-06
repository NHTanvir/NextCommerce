import React, { useEffect, useState, useCallback } from 'react';
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
  success: '#3fb950',
};

const COLLECTION_PALETTES = [
  '#e94560', '#58a6ff', '#3fb950', '#f59e0b',
  '#8957e5', '#ec4899', '#14b8a6', '#f97316',
];

interface CollectionDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productIds: string[];
  discountPercent: number;
  isActive: boolean;
  endsAt: string | null;
}

function getCollectionColor(index: number): string {
  return COLLECTION_PALETTES[index % COLLECTION_PALETTES.length];
}

function CollectionCard({
  item,
  index,
  onPress,
}: {
  item: CollectionDto;
  index: number;
  onPress: () => void;
}) {
  const color = getCollectionColor(index);
  const hasDiscount = item.discountPercent > 0;
  const productCount = item.productIds?.length ?? 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.cardAccent, { backgroundColor: color }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={[styles.cardName, { color }]} numberOfLines={2}>{item.name}</Text>
          {hasDiscount && (
            <View style={[styles.discountBadge, { backgroundColor: color + '20', borderColor: color + '50' }]}>
              <Text style={[styles.discountText, { color }]}>{item.discountPercent}% off</Text>
            </View>
          )}
        </View>
        {item.description && (
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        )}
        <View style={styles.cardMeta}>
          <Text style={styles.productCount}>{productCount} product{productCount !== 1 ? 's' : ''}</Text>
          {item.endsAt && (
            <Text style={styles.endsAt}>
              Ends {new Date(item.endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          )}
        </View>
      </View>
      <Text style={[styles.arrow, { color }]}>›</Text>
    </TouchableOpacity>
  );
}

export default function CollectionsScreen() {
  const navigation = useNavigation<Nav>();
  const [collections, setCollections] = useState<CollectionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCollections = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/collections`);
      const data: CollectionDto[] = await res.json();
      setCollections(Array.isArray(data) ? data.filter((c) => c.isActive) : []);
    } catch {
      setCollections([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, []);

  const handlePress = (collection: CollectionDto) => {
    (navigation as any).navigate('ProductList', { collectionSlug: collection.slug });
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
      data={collections}
      keyExtractor={(c) => c.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchCollections(true)}
          tintColor={COLORS.accent}
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.heading}>Collections</Text>
          <Text style={styles.sub}>Curated drops with exclusive savings</Text>
          {collections.length > 0 && (
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>
                {collections.length} active collection{collections.length !== 1 ? 's' : ''}
              </Text>
              {collections.some((c) => c.discountPercent > 0) && (
                <Text style={styles.statsDiscount}>
                  Up to {Math.max(...collections.map((c) => c.discountPercent))}% off
                </Text>
              )}
            </View>
          )}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No collections yet</Text>
          <Text style={styles.emptyDesc}>Check back soon for curated product drops.</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <CollectionCard
          item={item}
          index={index}
          onPress={() => handlePress(item)}
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
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  heading: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5, marginBottom: 4 },
  sub: { fontSize: 14, color: COLORS.muted },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  statsDiscount: { fontSize: 13, color: COLORS.success, fontWeight: '700' },

  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  cardBody: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.3,
  },
  discountBadge: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  productCount: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500',
  },
  endsAt: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  arrow: {
    fontSize: 24,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },

  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptyDesc: { fontSize: 14, color: COLORS.muted, textAlign: 'center' },
});
