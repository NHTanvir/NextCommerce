import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface Address {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CardInfo {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

const EMPTY_ADDRESS: Address = {
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
};

const EMPTY_CARD: CardInfo = {
  number: '',
  expiry: '',
  cvv: '',
  name: '',
};

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const [step, setStep] = useState<'address' | 'payment' | 'review'>('address');
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [card, setCard] = useState<CardInfo>(EMPTY_CARD);
  const [placing, setPlacing] = useState(false);

  const validateAddress = () => {
    return address.fullName && address.line1 && address.city && address.postalCode;
  };

  const validateCard = () => {
    const digits = card.number.replace(/\D/g, '');
    return digits.length === 16 && card.expiry.length === 5 && card.cvv.length >= 3 && card.name;
  };

  const handlePlaceOrder = () => {
    Alert.alert(
      'Order Placed!',
      'Your order has been placed successfully. You will receive an email confirmation shortly.',
      [
        {
          text: 'View Orders',
          onPress: () => navigation.navigate('OrderHistory' as never),
        },
      ]
    );
  };

  const setPlacing_ = () => {
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      handlePlaceOrder();
    }, 1500);
  };

  const Field = ({ label, value, onChange, placeholder, keyboardType = 'default', maxLength }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    keyboardType?: any;
    maxLength?: number;
  }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#475569"
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize="words"
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.steps}>
          {(['address', 'payment', 'review'] as const).map((s, i) => (
            <React.Fragment key={s}>
              <View style={[styles.stepDot, step === s && styles.stepDotActive, (step === 'payment' && s === 'address' || step === 'review') && styles.stepDotDone]}>
                <Text style={styles.stepNum}>{i + 1}</Text>
              </View>
              {i < 2 && <View style={styles.stepLine} />}
            </React.Fragment>
          ))}
        </View>

        {step === 'address' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <Field label="Full Name" value={address.fullName} onChange={(v) => setAddress({ ...address, fullName: v })} />
            <Field label="Address Line 1" value={address.line1} onChange={(v) => setAddress({ ...address, line1: v })} />
            <Field label="Address Line 2 (optional)" value={address.line2} onChange={(v) => setAddress({ ...address, line2: v })} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Field label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} maxLength={2} />
              </View>
            </View>
            <Field label="ZIP Code" value={address.postalCode} onChange={(v) => setAddress({ ...address, postalCode: v })} keyboardType="numeric" maxLength={10} />
            <TouchableOpacity
              style={[styles.btn, !validateAddress() && styles.btnDisabled]}
              onPress={() => validateAddress() && setStep('payment')}
            >
              <Text style={styles.btnText}>Continue to Payment</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'payment' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={styles.cardPreview}>
              <Text style={styles.cardNumber}>{card.number || '•••• •••• •••• ••••'}</Text>
              <View style={styles.cardBottom}>
                <Text style={styles.cardName}>{card.name || 'CARD HOLDER'}</Text>
                <Text style={styles.cardExpiry}>{card.expiry || 'MM/YY'}</Text>
              </View>
            </View>
            <Field
              label="Card Number"
              value={card.number}
              onChange={(v) => setCard({ ...card, number: formatCardNumber(v) })}
              keyboardType="numeric"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
            <Field
              label="Cardholder Name"
              value={card.name}
              onChange={(v) => setCard({ ...card, name: v.toUpperCase() })}
              placeholder="JOHN DOE"
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Expiry"
                  value={card.expiry}
                  onChange={(v) => setCard({ ...card, expiry: formatExpiry(v) })}
                  keyboardType="numeric"
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Field
                  label="CVV"
                  value={card.cvv}
                  onChange={(v) => setCard({ ...card, cvv: v.replace(/\D/g, '').slice(0, 4) })}
                  keyboardType="numeric"
                  placeholder="•••"
                  maxLength={4}
                />
              </View>
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnBack} onPress={() => setStep('address')}>
                <Text style={styles.btnBackText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnFlex, !validateCard() && styles.btnDisabled]}
                onPress={() => validateCard() && setStep('review')}
              >
                <Text style={styles.btnText}>Review Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'review' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Review & Place Order</Text>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Shipping to</Text>
              <Text style={styles.reviewValue}>{address.fullName}</Text>
              <Text style={styles.reviewValue}>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</Text>
              <Text style={styles.reviewValue}>{address.city}, {address.state} {address.postalCode}</Text>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Payment</Text>
              <Text style={styles.reviewValue}>Card ending in {card.number.replace(/\s/g, '').slice(-4)}</Text>
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnBack} onPress={() => setStep('payment')}>
                <Text style={styles.btnBackText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnFlex]} onPress={setPlacing_} disabled={placing}>
                <Text style={styles.btnText}>{placing ? 'Placing Order…' : 'Place Order'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 16, paddingBottom: 40 },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 0,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  stepDotActive: { borderColor: '#e94560', backgroundColor: '#e94560' },
  stepDotDone: { borderColor: '#22c55e', backgroundColor: '#22c55e' },
  stepNum: { fontSize: 12, fontWeight: '700', color: '#fff' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#1e293b', maxWidth: 60 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#f8fafc', marginBottom: 4, letterSpacing: -0.3 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 12,
    color: '#f8fafc',
    fontSize: 15,
  },
  row: { flexDirection: 'row' },
  cardPreview: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 20,
  },
  cardNumber: { fontSize: 18, fontFamily: 'monospace', color: '#f8fafc', letterSpacing: 2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardName: { fontSize: 12, color: '#94a3b8', letterSpacing: 1 },
  cardExpiry: { fontSize: 12, color: '#94a3b8' },
  reviewCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reviewLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  reviewValue: { fontSize: 14, color: '#f8fafc' },
  btn: {
    backgroundColor: '#e94560',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.4 },
  btnFlex: { flex: 1 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btnBack: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  btnBackText: { color: '#94a3b8', fontWeight: '600', fontSize: 15 },
});
