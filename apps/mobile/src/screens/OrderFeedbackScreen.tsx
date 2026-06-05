import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OrdersStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<OrdersStackParamList, 'OrderDetail'>;
type Route = RouteProp<{ params: { orderId: string; productTitle?: string; variantId?: string } }, 'params'>;

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
  star: '#f59e0b',
};

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('nc_token');
}

function StarRating({ rating, onRate }: { rating: number; onRate: (n: number) => void }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onRate(n)} activeOpacity={0.7}>
          <Text style={[styles.star, n <= rating && styles.starFilled]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const TAGS = [
  { label: 'True to size', value: 'true_to_size' },
  { label: 'Runs small', value: 'runs_small' },
  { label: 'Runs large', value: 'runs_large' },
  { label: 'Comfortable', value: 'comfortable' },
  { label: 'Great quality', value: 'great_quality' },
  { label: 'Fast shipping', value: 'fast_shipping' },
  { label: 'As described', value: 'as_described' },
];

export default function OrderFeedbackScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { orderId, productTitle = 'your order', variantId } = route.params ?? {};

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please select a star rating.');
      return;
    }
    if (body.trim().length < 10) {
      Alert.alert('Review too short', 'Please write at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          orderId,
          variantId,
          rating,
          title: title.trim() || undefined,
          body: body.trim(),
          tags: [...selectedTags],
        }),
      });

      if (res.ok) {
        setDone(true);
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert('Error', err?.message ?? 'Failed to submit review.');
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <View style={styles.doneContainer}>
        <Text style={styles.doneIcon}>🎉</Text>
        <Text style={styles.doneTitle}>Thank you for your review!</Text>
        <Text style={styles.doneSub}>Your feedback helps other shoppers.</Text>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.doneBtnText}>Back to Order</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Leave a Review</Text>
      <Text style={styles.sub}>for {productTitle}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Overall Rating *</Text>
        <StarRating rating={rating} onRate={setRating} />
        {rating > 0 && (
          <Text style={styles.ratingLabel}>
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Review Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Sum up your experience in a few words"
          placeholderTextColor={COLORS.muted}
          maxLength={100}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Your Review *</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={body}
          onChangeText={setBody}
          placeholder="What did you think about the product? How did it fit? Would you recommend it?"
          placeholderTextColor={COLORS.muted}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={1000}
        />
        <Text style={styles.charCount}>{body.length}/1000</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Quick Tags (optional)</Text>
        <View style={styles.tagGrid}>
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag.value}
              style={[
                styles.tagChip,
                selectedTags.has(tag.value) && styles.tagChipSelected,
              ]}
              onPress={() => toggleTag(tag.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedTags.has(tag.value) && styles.tagTextSelected,
                ]}
              >
                {tag.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, (submitting || rating === 0) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting || rating === 0}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Submit Review</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Reviews are subject to moderation and may take up to 24 hours to appear.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
    marginBottom: 10,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  star: {
    fontSize: 36,
    color: COLORS.border,
  },
  starFilled: {
    color: COLORS.star,
  },
  ratingLabel: {
    fontSize: 13,
    color: COLORS.star,
    fontWeight: '600',
    marginTop: 4,
  },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 14,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'right',
    marginTop: 4,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagChipSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  disclaimer: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
  doneContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  doneIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  doneTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  doneSub: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  doneBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
