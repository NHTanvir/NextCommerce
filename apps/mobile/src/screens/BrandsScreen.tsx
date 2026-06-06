import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  SectionList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ShopStackParamList } from '@/navigation/types';
import { fetchBrands as apiFetchBrands } from '@/api/catalog';

type Nav = NativeStackNavigationProp<ShopStackParamList>;

interface BrandItem {
  brand: string;
  productCount: number;
}

const BRAND_EMOJIS: Record<string, string> = {
  Nike: '✔️',
  Adidas: '🏆',
  Jordan: '🏀',
  Puma: '🐆',
  Reebok: '💪',
  Vans: '🛹',
  Converse: '⭐',
  'New Balance': '🏃',
  Asics: '🌊',
  Saucony: '🦘',
  Hoka: '🌈',
  'On Running': '⚡',
  Mizuno: '💎',
  Fila: '🎾',
  'Under Armour': '🦅',
};

function getEmoji(brand: string) {
  return BRAND_EMOJIS[brand] ?? '👟';
}

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
};

export default function BrandsScreen() {
  const navigation = useNavigation<Nav>();
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetchBrands()
      .then((data) => setBrands(data))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return brands;
    return brands.filter((b) => b.brand.toLowerCase().includes(search.toLowerCase()));
  }, [brands, search]);

  const sections = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => a.brand.localeCompare(b.brand));
    const map = new Map<string, BrandItem[]>();
    for (const b of sorted) {
      const letter = b.brand.charAt(0).toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(b);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  }, [filtered]);

  const navigateToProducts = (brand: string) => {
    (navigation as any).navigate('ProductList', { brand });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search brands…"
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: COLORS.muted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          {brands.length} brands · {brands.reduce((s, b) => s + b.productCount, 0).toLocaleString()} products
        </Text>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No brands match "{search}"</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.brand}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLetter}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.brandRow}
              onPress={() => navigateToProducts(item.brand)}
              activeOpacity={0.7}
            >
              <Text style={styles.brandEmoji}>{getEmoji(item.brand)}</Text>
              <View style={styles.brandInfo}>
                <Text style={styles.brandName}>{item.brand}</Text>
                <Text style={styles.brandCount}>{item.productCount} products</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 44,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
  statsRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statsText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: COLORS.bg,
  },
  sectionLetter: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 0.5,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  brandEmoji: {
    fontSize: 24,
    width: 44,
  },
  brandInfo: {
    flex: 1,
    gap: 2,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  brandCount: {
    fontSize: 12,
    color: COLORS.muted,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.muted,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
});
