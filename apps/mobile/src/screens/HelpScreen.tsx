import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Alert,
} from 'react-native';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ: FAQItem[] = [
  {
    category: 'Orders',
    question: 'How do I track my order?',
    answer: 'Go to My Orders in the Orders tab, select your order, and tap "Track Package". You can also use the tracking number in your shipping confirmation email.',
  },
  {
    category: 'Orders',
    question: 'Can I cancel or modify my order?',
    answer: 'Orders can only be cancelled or modified within 1 hour of placement, before processing begins. Go to your order details and tap "Cancel Order" if available.',
  },
  {
    category: 'Orders',
    question: 'How long does shipping take?',
    answer: 'Standard shipping: 3–7 business days. Express: 2–3 business days. Overnight: 1 business day. Free standard shipping on orders over $75.',
  },
  {
    category: 'Returns',
    question: 'What is the return policy?',
    answer: 'We accept returns within 30 days of delivery for unworn, unwashed items in original packaging. Sale items are final sale unless defective.',
  },
  {
    category: 'Returns',
    question: 'How do I start a return?',
    answer: 'Go to My Orders, select the delivered order, and tap "Request Return". You\'ll receive a prepaid shipping label by email within 1 business day.',
  },
  {
    category: 'Payments',
    question: 'What payment methods are accepted?',
    answer: 'We accept Visa, Mastercard, American Express, Discover, Apple Pay, Google Pay, and PayPal. Gift cards and store credit can be combined with any payment.',
  },
  {
    category: 'Payments',
    question: 'When will I be charged?',
    answer: 'Your card is charged when your order ships, not when you place it. Pre-authorized holds may appear immediately but are released if the order is cancelled.',
  },
  {
    category: 'Account',
    question: 'How do I earn loyalty points?',
    answer: 'Earn 1 point for every $1 spent. Bonus points for reviews, referrals, and special events. Redeem 100 points = $1 off your next order.',
  },
  {
    category: 'Account',
    question: 'How do I use a promo or coupon code?',
    answer: 'Enter your code in the "Promo Code" field at checkout. Only one code can be applied per order. Codes cannot be combined with other offers unless specified.',
  },
];

const CATEGORIES = ['All', ...new Set(FAQ.map((f) => f.category))];

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
};

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setOpen(!open)}
      activeOpacity={0.8}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Text style={styles.faqChevron}>{open ? '−' : '+'}</Text>
      </View>
      {open && <Text style={styles.faqAnswer}>{item.answer}</Text>}
    </TouchableOpacity>
  );
}

export default function HelpScreen() {
  const [category, setCategory] = useState('All');

  const filtered = category === 'All' ? FAQ : FAQ.filter((f) => f.category === category);

  const handleContact = (method: 'email' | 'chat') => {
    if (method === 'email') {
      Linking.openURL('mailto:support@nextcommerce.io').catch(() =>
        Alert.alert('Error', 'Could not open email app.')
      );
    } else {
      Alert.alert('Live Chat', 'Live chat is available Mon–Fri, 9am–6pm EST.\nAverage response time: < 5 minutes.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Help Center</Text>
      <Text style={styles.sub}>How can we help you today?</Text>

      {/* Contact options */}
      <View style={styles.contactRow}>
        <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('email')} activeOpacity={0.8}>
          <Text style={styles.contactIcon}>📧</Text>
          <Text style={styles.contactLabel}>Email Us</Text>
          <Text style={styles.contactMeta}>~24h response</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('chat')} activeOpacity={0.8}>
          <Text style={styles.contactIcon}>💬</Text>
          <Text style={styles.contactLabel}>Live Chat</Text>
          <Text style={styles.contactMeta}>Mon–Fri 9–6</Text>
        </TouchableOpacity>
      </View>

      {/* Category filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, category === c && styles.chipActive]}
              onPress={() => setCategory(c)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* FAQ */}
      <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
      <View style={styles.faqList}>
        {filtered.map((item, i) => (
          <FAQAccordion key={i} item={item} />
        ))}
      </View>

      <Text style={styles.footer}>
        Can't find what you're looking for? Email us at support@nextcommerce.io
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },

  heading: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  sub: { fontSize: 14, color: COLORS.muted, marginBottom: 20 },

  contactRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  contactCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  contactIcon: { fontSize: 28, marginBottom: 4 },
  contactLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  contactMeta: { fontSize: 11, color: COLORS.muted },

  categoryScroll: { marginBottom: 12 },
  categoryRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  faqList: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  faqItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 20,
  },
  faqChevron: {
    fontSize: 20,
    color: COLORS.accent,
    fontWeight: '700',
    lineHeight: 22,
  },
  faqAnswer: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
  },

  footer: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
