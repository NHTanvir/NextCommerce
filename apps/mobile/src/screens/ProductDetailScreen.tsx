import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackRouteProp } from '@react-navigation/native-stack';
import type { ProductDto } from '@nextcommerce/shared';
import { fetchProduct } from '@/api/catalog';
import { trackRecentlyViewed } from '@/screens/RecentlyViewedScreen';
import type { ShopStackParamList } from '@/navigation/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

type Route = NativeStackRouteProp<ShopStackParamList, 'ProductDetail'>;
type Nav = NativeStackNavigationProp<ShopStackParamList, 'ProductDetail'>;

const COLORS = {
  bg: '#0d1117',
  secondary: '#161b22',
  card: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
};

export function ProductDetailScreen() {
  const route = useRoute<Route>();
  const nav = useNavigation<Nav>();
  const { slug } = route.params;

  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    fetchProduct(slug)
      .then((p) => {
        setProduct(p);
        setLoading(false);
        trackRecentlyViewed({
          id: p.id,
          slug: p.slug,
          title: p.title,
          brand: p.brand ?? '',
          basePriceCents: p.variants?.[0]?.priceCents ?? 0,
          imageUrl: p.images?.[0]?.url,
          categoryName: (p as any).categoryName,
        });
        fetch(`${API_URL}/reviews?productId=${p.id}`)
          .then((r) => r.json())
          .then((reviews: Array<{ rating: number }>) => {
            if (Array.isArray(reviews) && reviews.length > 0) {
              setReviewCount(reviews.length);
              setAvgRating(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length);
            }
          })
          .catch(() => {});
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.notFound}>Product not found</Text>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const price = selectedVariant?.priceCents ?? product.variants?.[0]?.priceCents ?? 0;
  const uniqueSizes = [...new Set(product.variants?.map((v) => v.size) ?? [])].sort((a, b) => a - b);
  const uniqueColors = [...new Set(product.variants?.map((v) => v.color) ?? [])];

  function handleAddToCart() {
    if (!selectedVariantId) {
      Alert.alert('Select Size', 'Please select a size before adding to cart.');
      return;
    }
    Alert.alert('Added to Cart', `${product!.title} added successfully!`);
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imgBox}>
          {product.images?.[0]?.url ? (
            <Image source={{ uri: product.images[0].url }} style={styles.img} resizeMode="cover" />
          ) : (
            <Text style={styles.imgPlaceholder}>👟</Text>
          )}
        </View>

        <View style={styles.content}>
          {product.brand && <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>}
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>${(price / 100).toFixed(2)}</Text>

          {product.description && (
            <Text style={styles.description}>{product.description}</Text>
          )}

          {/* Ratings row */}
          <TouchableOpacity
            style={styles.ratingsRow}
            onPress={() => product && nav.navigate('ProductReviews', {
              productId: product.id,
              productTitle: product.title,
            })}
            activeOpacity={0.7}
          >
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Text key={n} style={[styles.ratingStar, n <= Math.round(avgRating) && styles.ratingStarFilled]}>
                  ★
                </Text>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {reviewCount > 0
                ? `${avgRating.toFixed(1)} · ${reviewCount} review${reviewCount !== 1 ? 's' : ''}`
                : 'No reviews yet'}
            </Text>
            <Text style={styles.ratingArrow}>›</Text>
          </TouchableOpacity>


          {/* Q&A link */}
          <TouchableOpacity
            style={styles.sizeGuideLink}
            onPress={() => product && nav.navigate('ProductQnA', {
              productId: product.id,
              productTitle: product.title,
            })}
            activeOpacity={0.7}
          >
            <Text style={styles.sizeGuideLinkText}>💬 Questions & Answers</Text>
          </TouchableOpacity>

          {/* Size guide link */}
          <TouchableOpacity
            style={styles.sizeGuideLink}
            onPress={() => nav.navigate('SizeGuide')}
            activeOpacity={0.7}
          >
            <Text style={styles.sizeGuideLinkText}>📏 Size Guide</Text>
          </TouchableOpacity>

          {/* Colors */}
          {uniqueColors.length > 0 && (
            <View style={styles.variantSection}>
              <Text style={styles.variantLabel}>COLOR</Text>
              <View style={styles.options}>
                {uniqueColors.map((color) => {
                  const v = product.variants?.find((v) => v.color === color);
                  const isSelected = selectedVariant?.color === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[styles.optionBtn, isSelected && styles.optionSelected]}
                      onPress={() => v && setSelectedVariantId(v.id)}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {color}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Sizes */}
          {uniqueSizes.length > 0 && (
            <View style={styles.variantSection}>
              <Text style={styles.variantLabel}>SIZE (US)</Text>
              <View style={styles.options}>
                {uniqueSizes.map((size) => {
                  const v = product.variants?.find((v) => v.size === size);
                  const oos = v?.stockQty === 0;
                  const isSelected = selectedVariant?.size === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[styles.sizeBtn, isSelected && styles.optionSelected, oos && styles.oosBtn]}
                      onPress={() => !oos && v && setSelectedVariantId(v.id)}
                      disabled={oos}
                    >
                      <Text style={[styles.sizeText, isSelected && styles.optionTextSelected, oos && styles.oosText]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Qty */}
          <View style={styles.qtyRow}>
            <Text style={styles.variantLabel}>QTY</Text>
            <View style={styles.qtyControl}>
              <TouchableOpacity onPress={() => setQty((q) => Math.max(1, q - 1))} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{qty}</Text>
              <TouchableOpacity onPress={() => setQty((q) => q + 1)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add to cart button fixed at bottom */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>
            {selectedVariantId ? `Add to Cart · $${((price * qty) / 100).toFixed(2)}` : 'Select a Size'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  notFound: { color: COLORS.muted, fontSize: 18 },
  backBtn: { marginTop: 16, padding: 12, backgroundColor: COLORS.card, borderRadius: 10 },
  backBtnText: { color: COLORS.accent, fontSize: 15, fontWeight: '600' },
  imgBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: { fontSize: 80 },
  content: { padding: 20, gap: 12 },
  brand: { fontSize: 11, fontWeight: '700', color: COLORS.muted, letterSpacing: 2 },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  price: { fontSize: 24, fontWeight: '900', color: COLORS.accent },
  description: { fontSize: 14, color: COLORS.muted, lineHeight: 22 },
  variantSection: { gap: 8 },
  variantLabel: { fontSize: 11, fontWeight: '700', color: COLORS.muted, letterSpacing: 1 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  optionSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  optionText: { fontSize: 13, color: COLORS.muted, fontWeight: '500' },
  optionTextSelected: { color: '#fff', fontWeight: '700' },
  sizeBtn: {
    width: 52,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  oosBtn: { opacity: 0.3 },
  oosText: { textDecorationLine: 'line-through' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  qtyBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.card },
  qtyBtnText: { fontSize: 20, color: COLORS.text },
  qtyNum: { width: 40, textAlign: 'center', color: COLORS.text, fontWeight: '700', fontSize: 16 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  addBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  ratingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  starsRow: { flexDirection: 'row', gap: 2 },
  ratingStar: { fontSize: 14, color: COLORS.border },
  ratingStarFilled: { color: '#f59e0b' },
  ratingText: { flex: 1, fontSize: 13, color: COLORS.muted },
  ratingArrow: { fontSize: 20, color: COLORS.muted },

  sizeGuideLink: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  sizeGuideLinkText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
});
