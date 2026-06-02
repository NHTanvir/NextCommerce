import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
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
}

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/products?search=${encodeURIComponent(q.trim())}&limit=20`);
      const data = await res.json();
      setResults(data.data ?? data ?? []);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search shoes, brands…"
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
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
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
          <Text style={styles.emptyTitle}>No results for "{query}"</Text>
          <Text style={styles.emptySubtitle}>Try different keywords or check the spelling.</Text>
        </View>
      )}

      {!loading && !searched && (
        <View style={styles.center}>
          <Text style={styles.hint}>Search for shoes, brands, categories…</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => navigation.navigate('ProductDetail', { slug: item.slug })}
            activeOpacity={0.7}
          >
            <View style={styles.resultInfo}>
              <Text style={styles.resultBrand}>{item.brand}</Text>
              <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
              {item.categoryName && (
                <Text style={styles.resultCategory}>{item.categoryName}</Text>
              )}
            </View>
            <Text style={styles.resultPrice}>
              ${(item.basePriceCents / 100).toFixed(0)}
            </Text>
          </TouchableOpacity>
        )}
      />
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
  hint: { color: '#6b7280', fontSize: 14, textAlign: 'center' },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: '#fff', fontWeight: '700', fontSize: 18, textAlign: 'center' },
  emptySubtitle: { color: '#9ca3af', fontSize: 14, textAlign: 'center' },
  list: { padding: 12 },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  resultInfo: { flex: 1, marginRight: 12 },
  resultBrand: { color: '#e94560', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  resultTitle: { color: '#e6edf3', fontWeight: '600', fontSize: 14, marginBottom: 2 },
  resultCategory: { color: '#6b7280', fontSize: 12 },
  resultPrice: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
