import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchSearch } from '@/api/catalog';

interface Product {
  id: string;
  title: string;
  brand: string;
  basePriceCents: number;
  avgRating: number;
  reviewCount: number;
  categoryName?: string;
  imageUrl?: string;
  slug: string;
}

const MAX_COMPARE = 3;

const COMPARE_ROWS = [
  { key: 'brand', label: 'Brand' },
  { key: 'categoryName', label: 'Category' },
  { key: 'basePriceCents', label: 'Price', format: (v: any) => v ? `$${(v / 100).toFixed(2)}` : '—' },
  { key: 'avgRating', label: 'Avg Rating', format: (v: any) => v ? `${Number(v).toFixed(1)} ★` : '—' },
  { key: 'reviewCount', label: 'Reviews', format: (v: any) => v ? String(v) : '0' },
];

export default function CompareScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    setSearching(true);
    try {
      const data = await fetchSearch(searchQuery.trim(), 6);
      setSearchResults(data as Product[]);
    } catch {
      Alert.alert('Error', 'Search failed.');
    } finally {
      setSearching(false);
    }
  };

  const addProduct = (product: Product) => {
    if (products.find((p) => p.id === product.id)) {
      Alert.alert('Already Added', 'This product is already in the comparison.');
      return;
    }
    if (products.length >= MAX_COMPARE) {
      Alert.alert('Limit Reached', `You can compare up to ${MAX_COMPARE} products at a time.`);
      return;
    }
    setProducts((prev) => [...prev, product]);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Compare</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowSearch((v) => !v)}
          disabled={products.length >= MAX_COMPARE}
        >
          <Text style={[styles.addBtnText, products.length >= MAX_COMPARE && styles.disabledText]}>
            + Add
          </Text>
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products…"
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={searching}>
            {searching ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.searchBtnText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {showSearch && searchResults.length > 0 && (
        <View style={styles.results}>
          {searchResults.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.resultRow}
              onPress={() => addProduct(product)}
            >
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{product.title}</Text>
                <Text style={styles.resultBrand}>{product.brand}</Text>
              </View>
              <Text style={styles.resultPrice}>
                ${(product.basePriceCents / 100).toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {products.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⚖️</Text>
          <Text style={styles.emptyTitle}>No products to compare</Text>
          <Text style={styles.emptyBody}>Tap "+ Add" to search and add products to compare.</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
          <ScrollView>
            {/* Product headers */}
            <View style={styles.row}>
              <View style={styles.attrCell}>
                <Text style={styles.attrLabel}>Product</Text>
              </View>
              {products.map((p) => (
                <View key={p.id} style={styles.productCell}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productTitle} numberOfLines={2}>{p.title}</Text>
                    <TouchableOpacity onPress={() => removeProduct(p.id)} style={styles.removeBtn}>
                      <Text style={styles.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Data rows */}
            {COMPARE_ROWS.map((row, idx) => (
              <View key={row.key} style={[styles.row, idx % 2 === 0 && styles.altRow]}>
                <View style={styles.attrCell}>
                  <Text style={styles.attrLabel}>{row.label}</Text>
                </View>
                {products.map((p) => {
                  const raw = (p as any)[row.key];
                  const display = row.format ? row.format(raw) : String(raw ?? '—');
                  return (
                    <View key={p.id} style={styles.valueCell}>
                      <Text style={styles.valueText}>{display}</Text>
                    </View>
                  );
                })}
                {/* Placeholder columns */}
                {Array.from({ length: MAX_COMPARE - products.length }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.valueCell}>
                    <Text style={styles.emptyCell}>—</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
}

const CELL_W = 140;
const ATTR_W = 100;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  backBtn: { width: 60 },
  backText: { color: '#e94560', fontSize: 15, fontWeight: '600' },
  heading: { fontSize: 17, fontWeight: '800', color: '#e6edf3' },
  addBtn: { width: 60, alignItems: 'flex-end' },
  addBtnText: { color: '#58a6ff', fontSize: 15, fontWeight: '600' },
  disabledText: { color: '#484f58' },
  searchBar: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: 8,
    padding: 10,
    color: '#e6edf3',
    fontSize: 14,
  },
  searchBtn: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  results: {
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
    maxHeight: 200,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '600', color: '#e6edf3' },
  resultBrand: { fontSize: 12, color: '#8b949e', marginTop: 2 },
  resultPrice: { fontSize: 14, fontWeight: '700', color: '#e94560' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#e6edf3' },
  emptyBody: { fontSize: 14, color: '#8b949e', textAlign: 'center', lineHeight: 20 },
  tableScroll: { flex: 1 },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  altRow: { backgroundColor: '#161b22' },
  attrCell: {
    width: ATTR_W,
    padding: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#21262d',
  },
  attrLabel: { fontSize: 12, fontWeight: '700', color: '#8b949e' },
  productCell: {
    width: CELL_W,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#21262d',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: '#e6edf3', lineHeight: 18 },
  removeBtn: { paddingLeft: 6 },
  removeBtnText: { fontSize: 14, color: '#8b949e' },
  valueCell: {
    width: CELL_W,
    padding: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#21262d',
  },
  valueText: { fontSize: 13, color: '#e6edf3', fontWeight: '500' },
  emptyCell: { fontSize: 13, color: '#484f58' },
});
