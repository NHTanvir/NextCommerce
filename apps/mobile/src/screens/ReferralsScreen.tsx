import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  Clipboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchReferralStats, fetchReferralHistory } from '@/api/referrals';
import type { ReferralStats, ReferralHistory } from '@/api/referrals';

const APP_URL = 'https://nextcommerce.app';

export default function ReferralsScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [history, setHistory] = useState<ReferralHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchReferralStats(), fetchReferralHistory()])
      .then(([s, h]) => {
        setStats(s);
        setHistory(h);
      })
      .catch(() => Alert.alert('Error', 'Could not load referral data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleShare = async () => {
    if (!stats?.code) return;
    try {
      await Share.share({
        message: `Use my referral code ${stats.code} when signing up at NextCommerce and get 250 loyalty points! ${APP_URL}/register?ref=${stats.code}`,
        title: 'Join NextCommerce',
      });
    } catch {
      // user cancelled share
    }
  };

  const handleCopy = () => {
    if (!stats?.code) return;
    Clipboard.setString(stats.code);
    Alert.alert('Copied!', `Referral code ${stats.code} copied to clipboard.`);
  };

  const STATUS_COLORS: Record<string, string> = {
    pending: '#f59e0b',
    completed: '#3fb950',
    paid: '#58a6ff',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Refer & Earn</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#e94560" size="large" />
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroIcon}>🎁</Text>
            <Text style={styles.heroTitle}>Give 250, Get 500</Text>
            <Text style={styles.heroSub}>
              Your friend gets 250 points when they sign up. You earn 500 points after their first purchase!
            </Text>
          </View>

          {/* Stats */}
          {stats && (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statVal}>{stats.totalReferrals}</Text>
                <Text style={styles.statLbl}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statVal}>{stats.completedReferrals}</Text>
                <Text style={styles.statLbl}>Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statVal}>{stats.pendingReferrals}</Text>
                <Text style={styles.statLbl}>Pending</Text>
              </View>
              <View style={[styles.statCard, styles.accentCard]}>
                <Text style={[styles.statVal, styles.accentVal]}>
                  {(stats.totalPointsEarned ?? 0).toLocaleString()}
                </Text>
                <Text style={styles.statLbl}>Points</Text>
              </View>
            </View>
          )}

          {/* Code card */}
          {stats?.code && (
            <View style={styles.codeCard}>
              <Text style={styles.codeLbl}>Your Referral Code</Text>
              <Text style={styles.codeText}>{stats.code}</Text>
              <View style={styles.codeActions}>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                  <Text style={styles.copyBtnText}>Copy Code</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                  <Text style={styles.shareBtnText}>Share ↗</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* History */}
          {history.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Referral History</Text>
              <View style={styles.historyList}>
                {history.map((r) => (
                  <View key={r.id} style={styles.historyRow}>
                    <View>
                      <Text style={styles.historyId}>#{r.id.slice(0, 8).toUpperCase()}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.historyRight}>
                      <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[r.status]}20` }]}>
                        <Text style={[styles.statusText, { color: STATUS_COLORS[r.status] }]}>
                          {r.status}
                        </Text>
                      </View>
                      {r.rewardPointsGranted && (
                        <Text style={styles.rewardPts}>+{r.rewardPointsGranted} pts</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Steps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            {[
              { n: '1', t: 'Share your code', b: 'Send your referral code to friends.' },
              { n: '2', t: 'Friend registers', b: 'They sign up and apply your code.' },
              { n: '3', t: 'Both get rewarded', b: 'Points are credited after their first order.' },
            ].map((s) => (
              <View key={s.n} style={styles.step}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{s.n}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{s.t}</Text>
                  <Text style={styles.stepBody}>{s.b}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  backBtn: { width: 60 },
  backText: { color: '#e94560', fontSize: 15, fontWeight: '600' },
  heading: { fontSize: 17, fontWeight: '800', color: '#e6edf3' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  contentInner: { padding: 16, gap: 16 },
  hero: { alignItems: 'center', paddingVertical: 12, gap: 8 },
  heroIcon: { fontSize: 40 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#e6edf3' },
  heroSub: { fontSize: 14, color: '#8b949e', textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  accentCard: { borderColor: 'rgba(233,69,96,0.3)', backgroundColor: 'rgba(233,69,96,0.08)' },
  statVal: { fontSize: 20, fontWeight: '800', color: '#e6edf3', letterSpacing: -0.5 },
  accentVal: { color: '#e94560' },
  statLbl: { fontSize: 11, color: '#8b949e', marginTop: 2 },
  codeCard: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  codeLbl: { fontSize: 12, fontWeight: '700', color: '#8b949e', textTransform: 'uppercase', letterSpacing: 0.6 },
  codeText: { fontSize: 28, fontWeight: '800', color: '#e94560', letterSpacing: 2, fontFamily: 'monospace' },
  codeActions: { flexDirection: 'row', gap: 12 },
  copyBtn: {
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  copyBtnText: { color: '#e6edf3', fontSize: 14, fontWeight: '600' },
  shareBtn: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  shareBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  section: { gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#e6edf3' },
  historyList: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: 10,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  historyId: { fontSize: 13, fontFamily: 'monospace', color: '#8b949e' },
  historyDate: { fontSize: 12, color: '#484f58', marginTop: 2 },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  statusBadge: { borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  rewardPts: { fontSize: 13, fontWeight: '700', color: '#3fb950' },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#e94560',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 1,
  },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#e6edf3', marginBottom: 2 },
  stepBody: { fontSize: 13, color: '#8b949e', lineHeight: 18 },
});
