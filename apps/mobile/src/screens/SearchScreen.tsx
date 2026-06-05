import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  brand: string;
  basePriceCents: number;
  categoryName?: string;
  type?: 'product' | 'category';
}

interface TrendingTerm {
  term: string;
  category: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
const MAX_RECENT = 8;

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trending, setTrending] = useState<TrendingTerm[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/search/trending?limit=8`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setTrending(data))
      .catch(() => {});
  }, []);

  const addToRecent = (term: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== term);
      return [term, ...filtered].slice(0, MAX_RECENT);
    });
  };

  const handleSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(trimmed)}&limit=20`);
      const data = await res.json();
      const items = data.results ?? data.data ?? data ?? [];
      setResults(items);
      setSearched(true);
      addToRecent(trimmed);
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTrendingPress = (term: string) => {
    setQuery(term);
    handleSearch(term);
  };

  const handleRecentPress = (term: string) => {
    setQuery(term);
    handleSearch(term);
  };

  const removeRecent = (term: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== term));
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const showIdleState = !loading && !searched && !query.trim();

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search shoes, brands, categories…"
          placeholderTextColor="#6b7280"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (!text.trim()) {
              setResults([]);
              setSearched(false);
            }
          }}
          onSubmitEditing={() => handleSearch(query)}
          returnKeyType="search"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearQuery}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color="#e94560" size="large" />
        </View>
      )}

      {!loading && searched && results.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No results for &ldquo;{query}&rdquo;</Text>
          <Text style={styles.emptySubtitle}>Try different keywords or check the spelling.</Text>
        </View>
      )}

      {showIdleState && (
        <ScrollView contentContainerStyle={styles.idleContent} keyboardShouldPersistTaps="handled">
          {recentSearches.length > 0 && (
            <View style={styles.idleSection}>
              <View style={styles.idleSectionHeader}>
                <Text style={styles.idleSectionTitle}>Recent</Text>
                <TouchableOpacity onPress={() => setRecentSearches([])}>
                  <Text style={styles.clearAllBtn}>Clear all</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={styles.recentItem}
                  onPress={() => handleRecentPress(term)}
                >
                  <Text style={styles.recentIcon}>🕐</Text>
                  <Text style={styles.recentText}>{term}</Text>
                  <TouchableOpacity onPress={() => removeRecent(term)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {trending.length > 0 && (
            <View style={styles.idleSection}>
              <Text style={styles.idleSectionTitle}>Trending</Text>
              <View style={styles.chipRow}>
                {trending.map((item) => (
                  <TouchableOpacity
                    key={item.term}
                    style={[
                      styles.trendChip,
                      item.category === 'brand' && styles.trendChipBrand,
                    ]}
                    onPress={() => handleTrendingPress(item.term)}
                  >
                    <Text style={styles.trendChipText}>
                      {item.category === 'brand' ? '🏷️' : '📂'} {item.term}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {!loading && searched && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>{results.length} results for &ldquo;{query}&rdquo;</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() =>
                item.type === 'category'
                  ? navigation.navigate('ProductList')
                  : navigation.navigate('ProductDetail', { slug: item.slug })
              }
              activeOpacity={0.7}
            >
              {item.type === 'category' ? (
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>📂</Text>
                </View>
              ) : (
                <View style={styles.productTag}>
                  <Text style={styles.productTagText}>👟</Text>
                </View>
              )}
              <View style={styles.resultInfo}>
                {item.brand && (
                  <Text style={styles.resultBrand}>{item.brand}</Text>
                )}
                <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                {item.categoryName && (
                  <Text style={styles.resultCategory}>{item.categoryName}</Text>
                )}
              </View>
              {item.basePriceCents > 0 && (
                <Text style={styles.resultPrice}>
                  ${(item.basePriceCents / 100).toFixed(0)}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f17' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    margin: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2d2d44',
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  clearBtn: { color: '#6b7280', fontSize: 16, padding: 4 },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: '#fff', fontWeight: '700', fontSize: 18, textAlign: 'center' },
  emptySubtitle: { color: '#9ca3af', fontSize: 14, textAlign: 'center' },

  idleContent: { padding: 16, gap: 24 },
  idleSection: { gap: 10 },
  idleSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idleSectionTitle: {
    color: '#e6edf3',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  clearAllBtn: { color: '#e94560', fontSize: 13, fontWeight: '600' },

  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1d2535',
  },
  recentIcon: { fontSize: 14, color: '#6b7280' },
  recentText: { flex: 1, color: '#c9d1d9', fontSize: 14 },
  removeBtn: { color: '#4b5563', fontSize: 13, padding: 2 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trendChip: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2d2d44',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  trendChipBrand: {
    borderColor: 'rgba(233,69,96,0.35)',
    backgroundColor: 'rgba(233,69,96,0.07)',
  },
  trendChipText: { color: '#c9d1d9', fontSize: 13, fontWeight: '500' },

  resultsCount: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  list: { padding: 12 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  categoryTag: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1d2d3e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTagText: { fontSize: 18 },
  productTag: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1d2d3e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTagText: { fontSize: 18 },
  resultInfo: { flex: 1, marginRight: 8 },
  resultBrand: { color: '#e94560', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  resultTitle: { color: '#e6edf3', fontWeight: '600', fontSize: 14, marginBottom: 2 },
  resultCategory: { color: '#6b7280', fontSize: 12 },
  resultPrice: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
