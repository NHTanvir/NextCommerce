import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';

interface LoyaltyData {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lifetimePoints: number;
  nextTierPoints: number | null;
  recentTransactions: Array<{
    id: string;
    type: 'earn' | 'redeem' | 'bonus' | 'expire' | 'refund';
    points: number;
    description: string;
    createdAt: string;
  }>;
}

const MOCK_DATA: LoyaltyData = {
  points: 1240,
  tier: 'silver',
  lifetimePoints: 2340,
  nextTierPoints: 1160,
  recentTransactions: [
    { id: 't1', type: 'earn', points: 150, description: 'Order #ABC123', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 't2', type: 'earn', points: 90, description: 'Order #DEF456', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 't3', type: 'redeem', points: -200, description: 'Discount applied to order', createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 't4', type: 'bonus', points: 50, description: 'Welcome bonus', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  ],
};

const TIER_ICONS: Record<string, string> = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' };
const TIER_COLORS: Record<string, string> = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#b9f2ff' };

function daysSince(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function LoyaltyScreen() {
  const [data] = useState<LoyaltyData>(MOCK_DATA);
  const [refreshing, setRefreshing] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleRedeem = () => {
    const pts = Number(redeemAmount);
    if (!pts || pts < 100) {
      Alert.alert('Invalid Amount', 'Minimum 100 points required to redeem.');
      return;
    }
    if (pts > data.points) {
      Alert.alert('Insufficient Points', `You only have ${data.points} points available.`);
      return;
    }
    const dollarValue = (pts / 100).toFixed(2);
    Alert.alert(
      'Confirm Redemption',
      `Redeem ${pts} points for $${dollarValue} off your next order?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Redeem', style: 'default', onPress: () => {
          setRedeemAmount('');
          Alert.alert('Success!', `$${dollarValue} discount applied to your account.`);
        }},
      ],
    );
  };

  const tierColor = TIER_COLORS[data.tier];
  const progressPct = data.nextTierPoints
    ? Math.min(100, ((500 - data.nextTierPoints) / 500) * 100)
    : 100;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
      }
    >
      {/* Tier card */}
      <View style={[styles.tierCard, { borderColor: tierColor }]}>
        <View style={styles.tierRow}>
          <Text style={styles.tierIcon}>{TIER_ICONS[data.tier]}</Text>
          <View style={styles.tierInfo}>
            <Text style={[styles.tierName, { color: tierColor }]}>
              {data.tier.charAt(0).toUpperCase() + data.tier.slice(1)} Member
            </Text>
            <Text style={styles.lifetimePts}>{data.lifetimePoints.toLocaleString()} lifetime pts</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsNum}>{data.points.toLocaleString()}</Text>
            <Text style={styles.pointsLabel}>pts</Text>
          </View>
        </View>

        {data.nextTierPoints !== null && (
          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPct}%` as any, backgroundColor: tierColor }]} />
            </View>
            <Text style={styles.progressLabel}>
              {data.nextTierPoints.toLocaleString()} pts to next tier
            </Text>
          </View>
        )}
      </View>

      {/* Redeem */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Redeem Points</Text>
        <Text style={styles.cardSub}>100 points = $1.00 discount</Text>
        <View style={styles.redeemRow}>
          <TextInput
            style={styles.redeemInput}
            value={redeemAmount}
            onChangeText={setRedeemAmount}
            keyboardType="numeric"
            placeholder="Enter points"
            placeholderTextColor={MUTED}
          />
          <Text style={styles.redeemHint}>
            = ${redeemAmount ? (Number(redeemAmount) / 100).toFixed(2) : '0.00'} off
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.redeemBtn, (!redeemAmount || Number(redeemAmount) < 100) && styles.redeemBtnDisabled]}
          onPress={handleRedeem}
          disabled={!redeemAmount || Number(redeemAmount) < 100}
        >
          <Text style={styles.redeemBtnText}>Redeem Points</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction history */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        {data.recentTransactions.map((tx) => (
          <View key={tx.id} style={styles.txRow}>
            <View style={styles.txLeft}>
              <Text style={[styles.txType, { color: tx.type === 'redeem' ? ACCENT : '#3fb950' }]}>
                {tx.type.toUpperCase()}
              </Text>
              <Text style={styles.txDesc}>{tx.description}</Text>
              <Text style={styles.txDate}>{daysSince(tx.createdAt)}</Text>
            </View>
            <Text style={[styles.txPoints, { color: tx.points > 0 ? '#3fb950' : ACCENT }]}>
              {tx.points > 0 ? '+' : ''}{tx.points}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const ACCENT = '#e94560';
const BG = '#0d1117';
const SURFACE = '#1c2128';
const BORDER = '#30363d';
const TEXT = '#e6edf3';
const MUTED = '#8b949e';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  tierCard: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    gap: 14,
  },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tierIcon: { fontSize: 36 },
  tierInfo: { flex: 1 },
  tierName: { fontSize: 16, fontWeight: '800' },
  lifetimePts: { fontSize: 12, color: MUTED, marginTop: 2 },
  pointsBadge: { alignItems: 'flex-end' },
  pointsNum: { fontSize: 28, fontWeight: '900', color: TEXT, lineHeight: 32 },
  pointsLabel: { fontSize: 11, color: MUTED, fontWeight: '600' },
  progressSection: { gap: 6 },
  progressBarBg: {
    height: 6,
    backgroundColor: BORDER,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 11, color: MUTED },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: TEXT },
  cardSub: { fontSize: 12, color: MUTED, marginTop: -4 },
  redeemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  redeemInput: {
    flex: 1,
    backgroundColor: '#0d1117',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: TEXT,
    fontSize: 16,
  },
  redeemHint: { fontSize: 13, color: MUTED },
  redeemBtn: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },
  redeemBtnDisabled: { opacity: 0.4 },
  redeemBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 12,
  },
  txLeft: { flex: 1 },
  txType: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  txDesc: { fontSize: 13, color: TEXT },
  txDate: { fontSize: 11, color: MUTED, marginTop: 2 },
  txPoints: { fontSize: 16, fontWeight: '700' },
});
