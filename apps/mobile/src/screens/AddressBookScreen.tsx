import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { fetchAddresses, createAddress, deleteAddress, type Address } from '@/api/addresses';

const COLORS = {
  bg: '#0d1117',
  surface: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  accent: '#e94560',
  success: '#3fb950',
};

const EMPTY_FORM = {
  line1: '',
  line2: '',
  city: '',
  country: 'US',
  postalCode: '',
};

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'BD', name: 'Bangladesh' },
];

export default function AddressBookScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const loadAddresses = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchAddresses();
      setAddresses(data);
      setLoaded(true);
    } catch (err: any) {
      if (!silent) setError(err.message ?? 'Failed to load addresses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAddresses(true);
  };

  const handleAdd = async () => {
    if (!form.line1 || !form.city || !form.postalCode) {
      setError('Line 1, city, and postal code are required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await createAddress({
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        country: form.country,
        postalCode: form.postalCode,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadAddresses(true);
    } catch (err: any) {
      setError(err.message ?? 'Failed to add address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to remove this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(id);
              setAddresses((prev) => prev.filter((a) => a.id !== id));
            } catch {
              Alert.alert('Error', 'Failed to delete address.');
            }
          },
        },
      ],
    );
  };

  if (!loaded && !loading) {
    return (
      <View style={styles.centerContainer}>
        <TouchableOpacity style={styles.loadBtn} onPress={() => loadAddresses()}>
          <Text style={styles.loadBtnText}>Load Addresses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.heading}>Address Book</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm((v) => !v)}
        >
          <Text style={styles.addBtnText}>{showForm ? 'Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Add form */}
      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>New Address</Text>
          <Text style={styles.label}>Address Line 1 *</Text>
          <TextInput
            style={styles.input}
            value={form.line1}
            onChangeText={(v) => setForm((f) => ({ ...f, line1: v }))}
            placeholder="123 Main St"
            placeholderTextColor={COLORS.muted}
          />
          <Text style={styles.label}>Address Line 2</Text>
          <TextInput
            style={styles.input}
            value={form.line2}
            onChangeText={(v) => setForm((f) => ({ ...f, line2: v }))}
            placeholder="Apt, Suite, etc."
            placeholderTextColor={COLORS.muted}
          />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={form.city}
                onChangeText={(v) => setForm((f) => ({ ...f, city: v }))}
                placeholder="New York"
                placeholderTextColor={COLORS.muted}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ width: 100 }}>
              <Text style={styles.label}>Postal Code *</Text>
              <TextInput
                style={styles.input}
                value={form.postalCode}
                onChangeText={(v) => setForm((f) => ({ ...f, postalCode: v }))}
                placeholder="10001"
                placeholderTextColor={COLORS.muted}
                keyboardType="numeric"
              />
            </View>
          </View>
          <Text style={styles.label}>Country</Text>
          <View style={styles.countryPicker}>
            {COUNTRIES.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[
                  styles.countryChip,
                  form.country === c.code && styles.countryChipSelected,
                ]}
                onPress={() => setForm((f) => ({ ...f, country: c.code }))}
              >
                <Text
                  style={[
                    styles.countryChipText,
                    form.country === c.code && styles.countryChipTextSelected,
                  ]}
                >
                  {c.code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleAdd}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Save Address</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Address list */}
      {loading ? (
        <ActivityIndicator color={COLORS.accent} style={{ marginTop: 32 }} />
      ) : addresses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📬</Text>
          <Text style={styles.emptyText}>No saved addresses yet.</Text>
          <Text style={styles.emptyHint}>Add an address to speed up checkout.</Text>
        </View>
      ) : (
        <View style={styles.addressList}>
          {addresses.map((addr) => (
            <View key={addr.id} style={styles.addressCard}>
              <View style={styles.addressBody}>
                <Text style={styles.addressLine}>{addr.line1}</Text>
                {addr.line2 ? <Text style={styles.addressLine}>{addr.line2}</Text> : null}
                <Text style={styles.addressLine}>
                  {addr.city}, {addr.postalCode}
                </Text>
                <Text style={styles.addressCountry}>{addr.country}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(addr.id)}
              >
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
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
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loadBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  addBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#2f1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9456040',
  },
  errorText: {
    color: COLORS.accent,
    fontSize: 13,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  countryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  countryChip: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  countryChipSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  countryChipText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  countryChipTextSelected: {
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 13,
    color: COLORS.muted,
  },
  addressList: {
    gap: 12,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressBody: {
    flex: 1,
  },
  addressLine: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  addressCountry: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
  deleteBtnText: {
    fontSize: 18,
  },
});
