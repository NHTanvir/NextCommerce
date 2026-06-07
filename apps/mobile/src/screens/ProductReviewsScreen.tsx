import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native-stack';
import type { ShopStackParamList } from '@/navigation/types';
import { fetchProductReviews, fetchRatingDistribution, type ReviewDto, type RatingDist } from '@/api/reviews';

type Route = RouteProp<{ params: { productId: string; productTitle?: string } }, 'params'>;

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
  star: '#f59e0b',
};

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Text key={n} style={{ fontSize: size, color: n <= rating ? COLORS.star : COLORS.border }}>
          ★
        </Text>
      ))}
    </View>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` as any }]} />
      </View>
      <Text style={styles.barCount}>{count}</Text>
    </View>
  );
}

export default function ProductReviewsScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { productId, productTitle = 'Product' } = route.params ?? {};

  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [dist, setDist] = useState<RatingDist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: `Reviews — ${productTitle}` });
  }, [navigation, productTitle]);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    Promise.all([
      fetchProductReviews(productId),
      fetchRatingDistribution(productId),
    ])
      .then(([reviewData, distData]) => {
        setReviews(reviewData);
        setDist(distData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

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
      data={reviews}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={
        <>
          {/* Summary */}
          <View style={styles.summary}>
            <Text style={styles.avgNumber}>{avg.toFixed(1)}</Text>
            <Stars rating={Math.round(avg)} size={20} />
            <Text style={styles.reviewCount}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
          </View>

          {/* Distribution bars */}
          {dist && reviews.length > 0 && (
            <View style={styles.distCard}>
              {([5, 4, 3, 2, 1] as (1 | 2 | 3 | 4 | 5)[]).map((n) => (
                <RatingBar key={n} label={`${n}★`} count={dist[n]} total={reviews.length} />
              ))}
            </View>
          )}

          {reviews.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⭐</Text>
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptySub}>Be the first to review this product.</Text>
            </View>
          )}

          {reviews.length > 0 && <Text style={styles.sectionLabel}>All Reviews</Text>}
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Stars rating={item.rating} />
            <Text style={styles.cardDate}>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          {item.title ? <Text style={styles.cardTitle}>{item.title}</Text> : null}
          <Text style={styles.cardBody}>{item.body}</Text>
          {item.user && (
            <Text style={styles.cardAuthor}>— {item.user.name}</Text>
          )}
        </View>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  summary: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  avgNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 52,
  },
  reviewCount: {
    fontSize: 13,
    color: COLORS.muted,
  },
  distCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 24,
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'right',
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.star,
    borderRadius: 3,
  },
  barCount: {
    width: 24,
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'left',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: 13, color: COLORS.muted, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.muted,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
  },
  cardAuthor: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
