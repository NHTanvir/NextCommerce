import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { submitReturnRequest } from '@/api/returns';

type ReturnReason =
  | 'defective'
  | 'wrong_item'
  | 'not_as_described'
  | 'changed_mind'
  | 'damaged_in_shipping'
  | 'other';

const REASONS: { value: ReturnReason; label: string; icon: string }[] = [
  { value: 'defective', label: 'Defective or broken', icon: '🔧' },
  { value: 'wrong_item', label: 'Wrong item sent', icon: '📦' },
  { value: 'not_as_described', label: 'Not as described', icon: '📝' },
  { value: 'changed_mind', label: 'Changed my mind', icon: '💭' },
  { value: 'damaged_in_shipping', label: 'Damaged in shipping', icon: '🚛' },
  { value: 'other', label: 'Other reason', icon: '❓' },
];

type ReturnMethod = 'refund' | 'exchange' | 'store_credit';

const METHODS: { value: ReturnMethod; label: string; sub: string }[] = [
  { value: 'refund', label: 'Original Payment', sub: 'Refund to your payment method (5-7 days)' },
  { value: 'store_credit', label: 'Store Credit', sub: 'Instant credit to your account' },
  { value: 'exchange', label: 'Exchange', sub: 'Swap for the same or different item' },
];


export default function RequestReturnScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId, orderNumber } = route.params ?? {};

  const [reason, setReason] = useState<ReturnReason | null>(null);
  const [method, setMethod] = useState<ReturnMethod>('refund');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = reason !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await submitReturnRequest({
        orderId,
        reason: reason!,
        notes: notes.trim() || undefined,
      });
      Alert.alert(
        'Return Requested',
        "Your return request has been submitted. We'll review it within 24 hours.",
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not submit return request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Request Return</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {orderNumber && (
          <View style={styles.orderRef}>
            <Text style={styles.orderRefText}>Order #{orderNumber}</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Why are you returning?</Text>
        <View style={styles.reasonList}>
          {REASONS.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[styles.reasonRow, reason === r.value && styles.selectedReason]}
              onPress={() => setReason(r.value)}
            >
              <Text style={styles.reasonIcon}>{r.icon}</Text>
              <Text style={[styles.reasonLabel, reason === r.value && styles.selectedReasonLabel]}>
                {r.label}
              </Text>
              <View style={[styles.radioOuter, reason === r.value && styles.radioOuterSelected]}>
                {reason === r.value && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>How would you like resolved?</Text>
        <View style={styles.methodList}>
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m.value}
              style={[styles.methodRow, method === m.value && styles.selectedMethod]}
              onPress={() => setMethod(m.value)}
            >
              <View style={styles.methodText}>
                <Text style={[styles.methodLabel, method === m.value && styles.selectedMethodLabel]}>
                  {m.label}
                </Text>
                <Text style={styles.methodSub}>{m.sub}</Text>
              </View>
              <View style={[styles.radioOuter, method === m.value && styles.radioOuterSelected]}>
                {method === m.value && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Additional notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Describe the issue in detail…"
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
        />

        <View style={styles.policyNote}>
          <Text style={styles.policyText}>
            📋 Returns are accepted within 30 days of delivery. Items must be unused and in original packaging.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Return Request</Text>
          )}
        </TouchableOpacity>
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
  content: { flex: 1 },
  contentInner: { padding: 16, gap: 12 },
  orderRef: {
    backgroundColor: '#161b22',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#21262d',
  },
  orderRefText: { color: '#8b949e', fontSize: 13, fontFamily: 'monospace' },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  reasonList: { gap: 6 },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: 10,
    padding: 14,
  },
  selectedReason: { borderColor: '#e94560', backgroundColor: 'rgba(233,69,96,0.06)' },
  reasonIcon: { fontSize: 20 },
  reasonLabel: { flex: 1, fontSize: 15, color: '#8b949e', fontWeight: '500' },
  selectedReasonLabel: { color: '#e6edf3' },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#30363d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: '#e94560' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e94560' },
  methodList: { gap: 6 },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#21262d',
    borderRadius: 10,
    padding: 14,
  },
  selectedMethod: { borderColor: '#3fb950', backgroundColor: 'rgba(63,185,80,0.06)' },
  methodText: { flex: 1 },
  methodLabel: { fontSize: 15, fontWeight: '600', color: '#8b949e' },
  selectedMethodLabel: { color: '#3fb950' },
  methodSub: { fontSize: 12, color: '#484f58', marginTop: 2 },
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
  textarea: { height: 100 },
  policyNote: {
    backgroundColor: 'rgba(88,166,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(88,166,255,0.15)',
    borderRadius: 10,
    padding: 12,
  },
  policyText: { fontSize: 13, color: '#58a6ff', lineHeight: 18 },
  submitBtn: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  disabledBtn: { opacity: 0.45 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
