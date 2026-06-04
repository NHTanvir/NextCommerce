import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Clipboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

type Tab = 'buy' | 'check' | 'my-cards';

interface GiftCard {
  id: string;
  code: string;
  initialAmountCents: number;
  remainingCents: number;
  isActive: boolean;
  expiresAt: string;
}

interface BalanceResult {
  code: string;
  remaining: number;
  isValid: boolean;
  expiresAt: string;
}

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Request failed');
  }
  return res.json();
}

export default function GiftCardsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<Tab>('buy');

  // Buy tab
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [purchasedCard, setPurchasedCard] = useState<GiftCard | null>(null);

  // Check balance tab
  const [balanceCode, setBalanceCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [balanceResult, setBalanceResult] = useState<BalanceResult | null>(null);

  const effectiveAmount = selectedAmount ?? (customAmount ? parseFloat(customAmount) : 0);
  const canPurchase = effectiveAmount >= 5 && recipientEmail.includes('@');

  const handlePurchase = async () => {
    if (!canPurchase) return;
    setPurchasing(true);
    try {
      const card = await apiFetch<GiftCard>('/gift-cards/purchase', {
        method: 'POST',
        body: JSON.stringify({
          amountCents: Math.round(effectiveAmount * 100),
          recipientEmail,
          recipientName: recipientName || undefined,
          message: message || undefined,
        }),
      });
      setPurchasedCard(card);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleCheckBalance = async () => {
    const trimmed = balanceCode.trim().toUpperCase();
    if (trimmed.length < 8) return;
    setChecking(true);
    setBalanceResult(null);
    try {
      const result = await apiFetch<BalanceResult>(`/gift-cards/balance/${trimmed}`);
      setBalanceResult(result);
    } catch {
      Alert.alert('Not Found', 'No gift card found with that code.');
    } finally {
      setChecking(false);
    }
  };

  const copyCode = (code: string) => {
    Clipboard.setString(code);
    Alert.alert('Copied', 'Gift card code copied to clipboard.');
  };

  const resetBuy = () => {
    setPurchasedCard(null);
    setSelectedAmount(null);
    setCustomAmount('');
    setRecipientEmail('');
    setRecipientName('');
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Gift Cards</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.tabs}>
        {(['buy', 'check', 'my-cards'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'buy' ? 'Buy' : tab === 'check' ? 'Check Balance' : 'My Cards'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* BUY TAB */}
        {activeTab === 'buy' && (
          purchasedCard ? (
            <View style={styles.successCard}>
              <Text style={styles.successIcon}>🎁</Text>
              <Text style={styles.successTitle}>Gift Card Purchased!</Text>
              <Text style={styles.successSub}>
                Your gift card has been sent to {recipientEmail}
              </Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>Gift Card Code</Text>
                <Text style={styles.codeText}>{purchasedCard.code}</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={() => copyCode(purchasedCard.code)}>
                  <Text style={styles.copyBtnText}>Copy Code</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.amountText}>
                Value: ${(purchasedCard.initialAmountCents / 100).toFixed(2)}
              </Text>
              <TouchableOpacity style={styles.resetBtn} onPress={resetBuy}>
                <Text style={styles.resetBtnText}>Buy Another</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.sectionLabel}>Select Amount</Text>
              <View style={styles.amountGrid}>
                {PRESET_AMOUNTS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[
                      styles.amountChip,
                      selectedAmount === amt && styles.selectedChip,
                    ]}
                    onPress={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                  >
                    <Text style={[
                      styles.amountChipText,
                      selectedAmount === amt && styles.selectedChipText,
                    ]}>
                      ${amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Custom amount ($5 min)"
                placeholderTextColor="#64748b"
                keyboardType="decimal-pad"
                value={customAmount}
                onChangeText={(v) => { setCustomAmount(v); setSelectedAmount(null); }}
              />

              <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Recipient Details</Text>
              <TextInput
                style={styles.input}
                placeholder="Recipient email *"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
                value={recipientEmail}
                onChangeText={setRecipientEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Recipient name (optional)"
                placeholderTextColor="#64748b"
                value={recipientName}
                onChangeText={setRecipientName}
              />
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Personal message (optional)"
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
                value={message}
                onChangeText={setMessage}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, !canPurchase && styles.disabledBtn]}
                onPress={handlePurchase}
                disabled={!canPurchase || purchasing}
              >
                {purchasing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    Purchase ${effectiveAmount > 0 ? effectiveAmount.toFixed(2) : '0.00'} Gift Card
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )
        )}

        {/* CHECK BALANCE TAB */}
        {activeTab === 'check' && (
          <View style={styles.form}>
            <Text style={styles.sectionLabel}>Enter Gift Card Code</Text>
            <TextInput
              style={styles.input}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              placeholderTextColor="#64748b"
              autoCapitalize="characters"
              value={balanceCode}
              onChangeText={setBalanceCode}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, balanceCode.trim().length < 8 && styles.disabledBtn]}
              onPress={handleCheckBalance}
              disabled={balanceCode.trim().length < 8 || checking}
            >
              {checking ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Check Balance</Text>
              )}
            </TouchableOpacity>

            {balanceResult && (
              <View style={[styles.resultCard, !balanceResult.isValid && styles.invalidCard]}>
                <Text style={styles.resultCode}>{balanceResult.code}</Text>
                {balanceResult.isValid ? (
                  <>
                    <Text style={styles.resultBalance}>
                      ${(balanceResult.remaining / 100).toFixed(2)} remaining
                    </Text>
                    <Text style={styles.resultExpiry}>
                      Expires {new Date(balanceResult.expiresAt).toLocaleDateString()}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.invalidText}>This card is no longer valid.</Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* MY CARDS TAB */}
        {activeTab === 'my-cards' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎁</Text>
            <Text style={styles.emptyTitle}>No gift cards yet</Text>
            <Text style={styles.emptyBody}>
              Gift cards you purchase will appear here.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setActiveTab('buy')}
            >
              <Text style={styles.primaryBtnText}>Buy a Gift Card</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: '#e94560' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#8b949e' },
  activeTabText: { color: '#e94560' },
  content: { flex: 1 },
  contentInner: { padding: 16 },
  form: { gap: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#8b949e', textTransform: 'uppercase', letterSpacing: 0.6 },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amountChip: {
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#161b22',
  },
  selectedChip: { borderColor: '#e94560', backgroundColor: 'rgba(233,69,96,0.1)' },
  amountChipText: { fontSize: 15, fontWeight: '700', color: '#8b949e' },
  selectedChipText: { color: '#e94560' },
  input: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: 10,
    padding: 12,
    color: '#e6edf3',
    fontSize: 15,
    fontFamily: 'System',
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  primaryBtn: {
    backgroundColor: '#e94560',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  disabledBtn: { opacity: 0.45 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  successCard: { alignItems: 'center', gap: 12, paddingTop: 24 },
  successIcon: { fontSize: 48 },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#e6edf3' },
  successSub: { fontSize: 14, color: '#8b949e', textAlign: 'center' },
  codeBox: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  codeLabel: { fontSize: 11, fontWeight: '700', color: '#8b949e', textTransform: 'uppercase', letterSpacing: 0.6 },
  codeText: { fontSize: 20, fontWeight: '800', color: '#e6edf3', letterSpacing: 1.5, fontFamily: 'monospace' },
  copyBtn: {
    backgroundColor: 'rgba(88,166,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(88,166,255,0.25)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  copyBtnText: { color: '#58a6ff', fontSize: 13, fontWeight: '600' },
  amountText: { fontSize: 18, fontWeight: '800', color: '#3fb950' },
  resetBtn: { borderWidth: 1, borderColor: '#21262d', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  resetBtnText: { color: '#8b949e', fontSize: 14, fontWeight: '600' },
  resultCard: {
    backgroundColor: 'rgba(63,185,80,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(63,185,80,0.25)',
    borderRadius: 12,
    padding: 16,
    gap: 6,
    marginTop: 8,
  },
  invalidCard: {
    backgroundColor: 'rgba(233,69,96,0.08)',
    borderColor: 'rgba(233,69,96,0.25)',
  },
  resultCode: { fontSize: 13, fontFamily: 'monospace', color: '#8b949e', letterSpacing: 1 },
  resultBalance: { fontSize: 22, fontWeight: '800', color: '#3fb950' },
  resultExpiry: { fontSize: 13, color: '#8b949e' },
  invalidText: { fontSize: 14, color: '#e94560', fontWeight: '600' },
  emptyState: { alignItems: 'center', gap: 12, paddingTop: 40 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#e6edf3' },
  emptyBody: { fontSize: 14, color: '#8b949e', textAlign: 'center', lineHeight: 20 },
});
