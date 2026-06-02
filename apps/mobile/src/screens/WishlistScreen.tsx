import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    slug: string;
    title: string;
    brand: string;
    basePriceCents: number;
  };
  addedAt: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export function WishlistScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token] = useState<string | null>(null);

  const fetchWishlist = useCallback(async (refresh = false) => {
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      const res = await fetch(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, [fetchWishlist]),
  );

  const handleRemove = async (productId: string, title: string) => {
    if (!token) return;
    Alert.alert('Remove from Wishlist', `Remove "${title}" from your wishlist?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${API_URL}/api/wishlist/${productId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            setItems((prev) => prev.filter((i) => i.productId !== productId));
          } catch {
            Alert.alert('Error', 'Failed to remove item.');
          }
        },
      },
    ]);
  };

  if (!token) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>♡</Text>
        <Text style={styles.emptyTitle}>Sign in to view wishlist</Text>
        <TouchableOpacity style={styles.signInBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signInBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#e94560" size="large" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>♡</Text>
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptySubtitle}>Save products you love to revisit them later.</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('ProductList')}>
          <Text style={styles.browseBtnText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchWishlist(true)} tintColor="#e94560" />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardInfo}
            onPress={() => navigation.navigate('ProductDetail', { slug: item.product.slug })}
            activeOpacity={0.7}
          >
            <Text style={styles.brand}>{item.product.brand}</Text>
            <Text style={styles.title} numberOfLines={2}>{item.product.title}</Text>
            <Text style={styles.price}>${(item.product.basePriceCents / 100).toFixed(0)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemove(item.productId, item.product.title)}
          >
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f17' },
  list: { padding: 12 },
  center: {
    flex: 1,
    backgroundColor: '#0f0f17',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  emptyIcon: { fontSize: 56, marginBottom: 4 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { color: '#9ca3af', textAlign: 'center', fontSize: 14 },
  browseBtn: {
    backgroundColor: '#e94560',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  signInBtn: {
    backgroundColor: '#e94560',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  signInBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2d2d44',
    alignItems: 'center',
  },
  cardInfo: { flex: 1, marginRight: 12 },
  brand: { color: '#e94560', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  title: { color: '#e6edf3', fontWeight: '600', fontSize: 14, marginBottom: 4 },
  price: { color: '#d1d5db', fontWeight: '800', fontSize: 15 },
  removeBtn: {
    padding: 8,
    backgroundColor: '#2d2d44',
    borderRadius: 6,
  },
  removeBtnText: { color: '#9ca3af', fontSize: 14 },
});
