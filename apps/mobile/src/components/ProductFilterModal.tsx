import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';

export interface FilterOptions {
  brand: string | null;
  maxPrice: number | null;
  sortBy: 'default' | 'price_asc' | 'price_desc' | 'newest';
  inStockOnly: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const BRANDS = ['Nike', 'Adidas', 'Puma', 'Converse', 'Reebok', 'Vans', 'Jordan', 'New Balance'];
const PRICE_RANGES = [
  { label: 'Any Price', value: null },
  { label: 'Under $50', value: 5000 },
  { label: 'Under $100', value: 10000 },
  { label: 'Under $150', value: 15000 },
  { label: 'Under $200', value: 20000 },
];
const SORT_OPTIONS: { label: string; value: FilterOptions['sortBy'] }[] = [
  { label: 'Default', value: 'default' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
];

const DEFAULT_FILTERS: FilterOptions = {
  brand: null,
  maxPrice: null,
  sortBy: 'default',
  inStockOnly: false,
};

export function ProductFilterModal({ visible, onClose, onApply, initialFilters }: Props) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters ?? DEFAULT_FILTERS);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const activeFiltersCount = [
    filters.brand !== null,
    filters.maxPrice !== null,
    filters.sortBy !== 'default',
    filters.inStockOnly,
  ].filter(Boolean).length;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filter & Sort</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.pills}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.pill, filters.sortBy === option.value && styles.pillActive]}
                  onPress={() => setFilters((f) => ({ ...f, sortBy: option.value }))}
                >
                  <Text style={[styles.pillText, filters.sortBy === option.value && styles.pillTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brand</Text>
            <View style={styles.pills}>
              <TouchableOpacity
                style={[styles.pill, filters.brand === null && styles.pillActive]}
                onPress={() => setFilters((f) => ({ ...f, brand: null }))}
              >
                <Text style={[styles.pillText, filters.brand === null && styles.pillTextActive]}>All</Text>
              </TouchableOpacity>
              {BRANDS.map((brand) => (
                <TouchableOpacity
                  key={brand}
                  style={[styles.pill, filters.brand === brand && styles.pillActive]}
                  onPress={() => setFilters((f) => ({ ...f, brand }))}
                >
                  <Text style={[styles.pillText, filters.brand === brand && styles.pillTextActive]}>{brand}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Max Price</Text>
            <View style={styles.pills}>
              {PRICE_RANGES.map((range) => (
                <TouchableOpacity
                  key={String(range.value)}
                  style={[styles.pill, filters.maxPrice === range.value && styles.pillActive]}
                  onPress={() => setFilters((f) => ({ ...f, maxPrice: range.value }))}
                >
                  <Text style={[styles.pillText, filters.maxPrice === range.value && styles.pillTextActive]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <Text style={styles.sectionTitle}>In Stock Only</Text>
              <Switch
                value={filters.inStockOnly}
                onValueChange={(v) => setFilters((f) => ({ ...f, inStockOnly: v }))}
                trackColor={{ false: '#1e293b', true: '#e94560' }}
                thumbColor="#f8fafc"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  resetText: { fontSize: 14, color: '#e94560', fontWeight: '600' },
  closeText: { fontSize: 18, color: '#94a3b8' },
  body: { flex: 1 },
  bodyContent: { padding: 16, gap: 24 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#1e293b',
  },
  pillActive: { borderColor: '#e94560', backgroundColor: 'rgba(233,69,96,0.12)' },
  pillText: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  pillTextActive: { color: '#e94560', fontWeight: '700' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#1e293b' },
  applyBtn: { backgroundColor: '#e94560', borderRadius: 12, padding: 15, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
