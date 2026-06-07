import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CartStackParamList, RootStackParamList } from '../navigation/types';
import { PriceTag } from '../components/PriceTag';
import { validateCoupon } from '@/api/coupons';

type Nav = NativeStackNavigationProp<CartStackParamList>;

interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  priceCents: number;
  productTitle: string;
  size: string;
  color: string;
}

export function CartScreen() {
  const navigation = useNavigation<Nav>();
  const [items] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setValidatingCoupon(true);
      const data = await validateCoupon(couponCode.trim(), subtotal);
      if (data.valid) {
        setDiscount(data.discountCents);
        Alert.alert('Coupon Applied!', `You saved ${(data.discountCents / 100).toFixed(2)} USD`);
      } else {
        Alert.alert('Invalid Coupon', data.message ?? 'Invalid coupon code');
      }
    } catch {
      Alert.alert('Error', 'Failed to validate coupon.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add products to your cart to see them here.</Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => navigation.navigate('ProductList')}
        >
          <Text style={styles.shopBtnText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={2}>{item.productTitle}</Text>
              <Text style={styles.itemMeta}>Size {item.size} · {item.color}</Text>
            </View>
            <View style={styles.itemRight}>
              <PriceTag cents={item.priceCents * item.quantity} />
              <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.couponRow}>
              <TextInput
                style={styles.couponInput}
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder="Coupon code"
                placeholderTextColor="#6b7280"
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={handleValidateCoupon}
              />
              <TouchableOpacity
                style={styles.couponBtn}
                onPress={handleValidateCoupon}
                disabled={validatingCoupon}
              >
                {validatingCoupon ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.couponBtnText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <PriceTag cents={subtotal} />
            </View>
            {discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.discountLabel}>Discount</Text>
                <Text style={styles.discountValue}>-{(discount / 100).toFixed(2)} USD</Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <PriceTag cents={total} />
            </View>
          </View>
        }
      />

      <View style={styles.checkout}>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f17' },
  empty: {
    flex: 1,
    backgroundColor: '#0f0f17',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  emptySubtitle: { color: '#9ca3af', textAlign: 'center' },
  shopBtn: {
    backgroundColor: '#e94560',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { padding: 16, paddingBottom: 100 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  itemInfo: { flex: 1, marginRight: 12 },
  itemTitle: { color: '#d1d5db', fontWeight: '600', fontSize: 14, marginBottom: 4 },
  itemMeta: { color: '#9ca3af', fontSize: 12 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  itemQty: { color: '#9ca3af', fontSize: 12 },
  summary: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2d2d44',
    gap: 12,
  },
  couponRow: { flexDirection: 'row', gap: 8 },
  couponInput: {
    flex: 1,
    backgroundColor: '#0f0f17',
    borderWidth: 1,
    borderColor: '#2d2d44',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  couponBtn: {
    backgroundColor: '#2d2d44',
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  couponBtnText: { color: '#d1d5db', fontWeight: '600', fontSize: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#9ca3af', fontSize: 14 },
  discountLabel: { color: '#10b981', fontSize: 14 },
  discountValue: { color: '#10b981', fontWeight: '700', fontSize: 14 },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#2d2d44',
    paddingTop: 12,
    marginTop: 4,
  },
  grandTotalLabel: { color: '#fff', fontWeight: '700', fontSize: 16 },
  checkout: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#0f0f17',
    borderTopWidth: 1,
    borderTopColor: '#2d2d44',
  },
  checkoutBtn: {
    backgroundColor: '#e94560',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
