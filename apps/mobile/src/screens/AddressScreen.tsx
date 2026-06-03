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
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const MOCK_ADDRESSES: Address[] = [
  {
    id: '1',
    label: 'Home',
    fullName: 'John Doe',
    line1: '123 Main Street',
    line2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    fullName: 'John Doe',
    line1: '456 Broadway',
    line2: '',
    city: 'New York',
    state: 'NY',
    postalCode: '10013',
    country: 'US',
    isDefault: false,
  },
];

export default function AddressScreen() {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Address, 'id' | 'isDefault'>>({
    label: 'Home',
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  const handleAdd = () => {
    if (!form.fullName || !form.line1 || !form.city || !form.postalCode) {
      Alert.alert('Required', 'Please fill in all required fields.');
      return;
    }
    const newAddr: Address = {
      id: Date.now().toString(),
      ...form,
      isDefault: addresses.length === 0,
    };
    setAddresses((prev) => [...prev, newAddr]);
    setShowForm(false);
    setForm({ label: 'Home', fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US' });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setAddresses((prev) => prev.filter((a) => a.id !== id)),
      },
    ]);
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Saved Addresses</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
            <Text style={styles.addBtnText}>{showForm ? 'Cancel' : '+ Add'}</Text>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>New Address</Text>
            {[
              { key: 'label', label: 'Label (e.g. Home, Office)' },
              { key: 'fullName', label: 'Full Name *' },
              { key: 'line1', label: 'Address Line 1 *' },
              { key: 'line2', label: 'Address Line 2' },
              { key: 'city', label: 'City *' },
              { key: 'state', label: 'State' },
              { key: 'postalCode', label: 'ZIP Code *', keyboard: 'numeric' },
            ].map(({ key, label, keyboard }) => (
              <View key={key} style={styles.field}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={(form as any)[key]}
                  onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                  placeholder={label}
                  placeholderTextColor="#475569"
                  keyboardType={(keyboard as any) ?? 'default'}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        )}

        {addresses.map((addr) => (
          <View key={addr.id} style={[styles.card, addr.isDefault && styles.cardDefault]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardLabel}>
                <Text style={styles.labelText}>{addr.label}</Text>
                {addr.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.addrLine}>{addr.fullName}</Text>
            <Text style={styles.addrLine}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</Text>
            <Text style={styles.addrLine}>{addr.city}, {addr.state} {addr.postalCode}</Text>
            <View style={styles.cardActions}>
              {!addr.isDefault && (
                <TouchableOpacity onPress={() => handleSetDefault(addr.id)}>
                  <Text style={styles.actionLink}>Set as Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleDelete(addr.id)}>
                <Text style={[styles.actionLink, { color: '#e94560' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {addresses.length === 0 && !showForm && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyText}>No saved addresses yet</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#f8fafc', letterSpacing: -0.5 },
  addBtn: { backgroundColor: '#e94560', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  form: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formTitle: { fontSize: 15, fontWeight: '700', color: '#f8fafc', marginBottom: 4 },
  field: { gap: 5 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 10,
    color: '#f8fafc',
    fontSize: 14,
  },
  saveBtn: { backgroundColor: '#e94560', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardDefault: { borderColor: '#e94560', borderWidth: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cardLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  labelText: { fontSize: 14, fontWeight: '700', color: '#f8fafc' },
  defaultBadge: { backgroundColor: 'rgba(233,69,96,0.15)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  defaultBadgeText: { fontSize: 10, fontWeight: '700', color: '#e94560', textTransform: 'uppercase' },
  addrLine: { fontSize: 13, color: '#94a3b8' },
  cardActions: { flexDirection: 'row', gap: 16, marginTop: 8 },
  actionLink: { fontSize: 13, fontWeight: '600', color: '#3b82f6' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: '#475569' },
});
