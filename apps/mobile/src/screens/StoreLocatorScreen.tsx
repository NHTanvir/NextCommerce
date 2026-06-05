import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  hours: string;
  distance?: number;
}

const MOCK_STORES: Store[] = [
  {
    id: '1',
    name: 'NextCommerce NYC Flagship',
    address: '350 5th Ave',
    city: 'New York',
    state: 'NY',
    phone: '+1 (212) 555-0101',
    hours: 'Mon–Sat 10am–9pm · Sun 11am–7pm',
    distance: 0.8,
  },
  {
    id: '2',
    name: 'NextCommerce SoHo',
    address: '128 Spring St',
    city: 'New York',
    state: 'NY',
    phone: '+1 (212) 555-0202',
    hours: 'Daily 10am–8pm',
    distance: 1.4,
  },
  {
    id: '3',
    name: 'NextCommerce LA',
    address: '8500 Beverly Blvd',
    city: 'Los Angeles',
    state: 'CA',
    phone: '+1 (310) 555-0303',
    hours: 'Mon–Sat 10am–9pm · Sun 11am–7pm',
    distance: 2792,
  },
  {
    id: '4',
    name: 'NextCommerce Chicago',
    address: '101 N Michigan Ave',
    city: 'Chicago',
    state: 'IL',
    phone: '+1 (312) 555-0404',
    hours: 'Mon–Sat 10am–8pm · Sun 12pm–6pm',
    distance: 789,
  },
  {
    id: '5',
    name: 'NextCommerce Miami Beach',
    address: '1601 Collins Ave',
    city: 'Miami Beach',
    state: 'FL',
    phone: '+1 (305) 555-0505',
    hours: 'Daily 11am–9pm',
    distance: 1284,
  },
  {
    id: '6',
    name: 'NextCommerce San Francisco',
    address: '298 Post St',
    city: 'San Francisco',
    state: 'CA',
    phone: '+1 (415) 555-0606',
    hours: 'Mon–Sat 10am–7pm · Sun 11am–6pm',
    distance: 2572,
  },
];

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
};

function formatDistance(mi?: number) {
  if (!mi) return '';
  if (mi < 10) return `${mi.toFixed(1)} mi`;
  return `${Math.round(mi)} mi`;
}

export default function StoreLocatorScreen() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_STORES.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.city.toLowerCase().includes(q) ||
      s.state.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q)
    );
  });

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`).catch(() =>
      Alert.alert('Error', 'Could not open phone app.')
    );
  };

  const handleDirections = (store: Store) => {
    const addr = encodeURIComponent(`${store.address}, ${store.city}, ${store.state}`);
    const url = `https://maps.google.com/maps?q=${addr}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open maps.'));
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by city or state..."
            placeholderTextColor={COLORS.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          <Text style={styles.resultsCount}>
            {filtered.length} store{filtered.length !== 1 ? 's' : ''} found
          </Text>
        </>
      }
      data={filtered}
      keyExtractor={(s) => s.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.cardLeft}>
              <Text style={styles.storeName}>{item.name}</Text>
              <Text style={styles.storeAddress}>{item.address}</Text>
              <Text style={styles.storeCity}>{item.city}, {item.state}</Text>
            </View>
            {item.distance !== undefined && (
              <Text style={styles.distance}>{formatDistance(item.distance)}</Text>
            )}
          </View>

          <Text style={styles.hours}>{item.hours}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.dirBtn]}
              onPress={() => handleDirections(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>📍 Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.callBtn]}
              onPress={() => handleCall(item.phone)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>📞 Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },

  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 12,
  },

  resultsCount: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 12,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  cardLeft: { flex: 1, gap: 2 },

  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },

  storeAddress: {
    fontSize: 13,
    color: COLORS.muted,
  },

  storeCity: {
    fontSize: 13,
    color: COLORS.muted,
  },

  distance: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
    marginLeft: 8,
  },

  hours: {
    fontSize: 12,
    color: COLORS.muted,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
  },

  actionBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
  },

  dirBtn: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },

  callBtn: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
  },

  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
});
