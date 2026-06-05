import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoyaltyBalance {
  points: number;
  tier: string;
  lifetimePoints: number;
  nextTierPoints: number | null;
}

interface LoyaltyTransaction {
  id: string;
  type: 'earn' | 'redeem' | 'bonus' | 'expire' | 'refund';
  points: number;
  description: string;
  createdAt: string;
}

const TIER_ICONS: Record<string, string> = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' };
const TIER_COLORS: Record<string, string> = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#b9f2ff' };
const TIER_NEXT: Record<string, number> = { bronze: 500, silver: 1500, gold: 5000, platinum: 0 };

const TX_TYPE_LABELS: Record<string, { label: string; color: string; prefix: string }> = {
  earn:    { label: 'Earned',   color: '#3fb950', prefix: '+' },
  bonus:   { label: 'Bonus',    color: '#8957e5', prefix: '+' },
  redeem:  { label: 'Redeemed', color: '#e94560', prefix: '-' },
  expire:  { label: 'Expired',  color: '#8b949e', prefix: '-' },
  refund:  { label: 'Refunded', color: '#58a6ff', prefix: '+' },
};

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

function daysSince(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

export default function LoyaltyScreen() {
  const [balance, setBalance] = useState<LoyaltyBalance | null>(null);
  const [history, setHistory] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) {
        setError('Please sign in to view your loyalty points.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const [balRes, histRes] = await Promise.all([
        fetch(`${API_URL}/api/loyalty/balance`, { headers }),
        fetch(`${API_URL}/api/loyalty/history?limit=20`, { headers }),
      ]);

      if (balRes.ok) setBalance(await balRes.json());
      if (histRes.ok) setHistory(await histRes.json());
    } catch {
      setError('Failed to load loyalty data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRedeem = async () => {
    const pts = Number(redeemAmount);
    if (!pts || pts < 100) {
      Alert.alert('Invalid Amount', 'Minimum 100 points required to redeem.');
      return;
    }
    if (balance && pts > balance.points) {
      Alert.alert('Insufficient Points', `You only have ${balance.points.toLocaleString()} points.`);
      return;
    }
    const dollarValue = (pts / 100).toFixed(2);
    Alert.alert(
      'Confirm Redemption',
      `Redeem ${pts.toLocaleString()} points for $${dollarValue} off your next order?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            try {
              setRedeeming(true);
              const token = await getAuthToken();
              const res = await fetch(`${API_URL}/api/loyalty/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ points: pts }),
              });
              if (!res.ok) throw new Error('Redemption failed');
              setRedeemAmount('');
              Alert.alert('Success!', `$${dollarValue} discount has been added to your account.`);
              loadData();
            } catch {
              Alert.alert('Error', 'Failed to redeem points. Please try again.');
            } finally {
              setRedeeming(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>⭐</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadData()}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tier = balance?.tier ?? 'bronze';
  const tierColor = TIER_COLORS[tier] ?? '#cd7f32';
  const tierMaxPts = TIER_NEXT[tier] ?? 0;
  const tierMinPts = TIER_NEXT[
    Object.keys(TIER_NEXT).find((k) => TIER_NEXT[k] < (tierMaxPts || Infinity) && TIER_NEXT[k] > 0 && k !== tier) ?? 'bronze'
  ] ?? 0;

  const progressPct = tierMaxPts > 0 && balance
    ? Math.min(100, ((balance.lifetimePoints - tierMinPts) / (tierMaxPts - tierMinPts)) * 100)
    : 100;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadData(true)}
          tintColor={ACCENT}
        />
      }
    >
      {/* Tier card */}
      {balance && (
        <View style={[styles.tierCard, { borderColor: tierColor + '80' }]}>
          <View style={styles.tierRow}>
            <Text style={styles.tierIcon}>{TIER_ICONS[tier] ?? '⭐'}</Text>
            <View style={styles.tierInfo}>
              <Text style={[styles.tierName, { color: tierColor }]}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)} Member
              </Text>
              <Text style={styles.lifetimePts}>{balance.lifetimePoints.toLocaleString()} lifetime pts</Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsNum}>{balance.points.toLocaleString()}</Text>
              <Text style={styles.pointsLabel}>pts</Text>
            </View>
          </View>

          {balance.nextTierPoints !== null && balance.nextTierPoints > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.max(4, progressPct)}%` as any, backgroundColor: tierColor },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {balance.nextTierPoints.toLocaleString()} pts to next tier
              </Text>
            </View>
          )}

          {balance.tier === 'platinum' && (
            <Text style={[styles.progressLabel, { color: tierColor }]}>
              💎 You've reached the highest tier!
            </Text>
          )}
        </View>
      )}

      {/* Tier perks */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tier Benefits</Text>
        {[
          { tier: 'bronze', icon: '🥉', perks: ['1 pt per $1 spent', 'Birthday bonus'] },
          { tier: 'silver', icon: '🥈', perks: ['1.5x points multiplier', 'Free standard shipping', 'Early access to sales'] },
          { tier: 'gold', icon: '🥇', perks: ['2x points multiplier', 'Free express shipping', 'Priority support', 'Exclusive offers'] },
          { tier: 'platinum', icon: '💎', perks: ['3x points multiplier', 'Free overnight shipping', 'Dedicated support', 'VIP product launches'] },
        ].map((t) => (
          <View
            key={t.tier}
            style={[
              styles.perkRow,
              t.tier === tier && { backgroundColor: (TIER_COLORS[t.tier] ?? '#fff') + '15', borderRadius: 8, padding: 8 },
            ]}
          >
            <Text style={styles.perkTierIcon}>{t.icon}</Text>
            <View>
              <Text style={[styles.perkTierName, t.tier === tier && { color: TIER_COLORS[t.tier] }]}>
                {t.tier.charAt(0).toUpperCase() + t.tier.slice(1)}
                {t.tier === tier && ' (Current)'}
              </Text>
              {t.perks.map((perk) => (
                <Text key={perk} style={styles.perkItem}>• {perk}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Redeem */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Redeem Points</Text>
        <Text style={styles.cardSub}>100 points = $1.00 discount on your next order</Text>
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
            =${redeemAmount ? (Number(redeemAmount) / 100).toFixed(2) : '0.00'}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.redeemBtn,
            (!redeemAmount || Number(redeemAmount) < 100 || redeeming) && styles.redeemBtnDisabled,
          ]}
          onPress={handleRedeem}
          disabled={!redeemAmount || Number(redeemAmount) < 100 || redeeming}
        >
          <Text style={styles.redeemBtnText}>
            {redeeming ? 'Redeeming…' : 'Redeem Points'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transaction history */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Transaction History</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyTx}>No transactions yet. Start earning points by shopping!</Text>
        ) : (
          history.map((tx, i) => {
            const meta = TX_TYPE_LABELS[tx.type] ?? TX_TYPE_LABELS.earn;
            return (
              <View
                key={tx.id}
                style={[styles.txRow, i === history.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={[styles.txIconBadge, { backgroundColor: meta.color + '22' }]}>
                  <Text style={{ fontSize: 14 }}>
                    {tx.type === 'earn' ? '⬆️' : tx.type === 'redeem' ? '🎟️' : tx.type === 'bonus' ? '⭐' : tx.type === 'expire' ? '⏰' : '↩️'}
                  </Text>
                </View>
                <View style={styles.txLeft}>
                  <Text style={[styles.txType, { color: meta.color }]}>{meta.label}</Text>
                  <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                  <Text style={styles.txDate}>{daysSince(tx.createdAt)}</Text>
                </View>
                <Text style={[styles.txPoints, { color: meta.color }]}>
                  {meta.prefix}{Math.abs(tx.points).toLocaleString()}
                </Text>
              </View>
            );
          })
        )}
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
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG,
    gap: 16,
    padding: 32,
  },
  errorIcon: { fontSize: 48 },
  errorText: { color: MUTED, fontSize: 15, textAlign: 'center' },
  retryBtn: {
    backgroundColor: ACCENT,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

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

  perkRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  perkTierIcon: { fontSize: 22, marginTop: 2 },
  perkTierName: { fontSize: 13, fontWeight: '700', color: TEXT, marginBottom: 4 },
  perkItem: { fontSize: 12, color: MUTED, lineHeight: 18 },

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
  redeemHint: { fontSize: 14, color: MUTED, minWidth: 60 },
  redeemBtn: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },
  redeemBtnDisabled: { opacity: 0.4 },
  redeemBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  emptyTx: { color: MUTED, fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  txIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txLeft: { flex: 1 },
  txType: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  txDesc: { fontSize: 13, color: TEXT },
  txDate: { fontSize: 11, color: MUTED, marginTop: 2 },
  txPoints: { fontSize: 16, fontWeight: '700' },
});
