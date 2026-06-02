import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<AccountStackParamList>;

interface SettingRow {
  label: string;
  description?: string;
  value: boolean;
  key: string;
}

interface SettingsState {
  pushNotifications: boolean;
  orderUpdates: boolean;
  promoEmails: boolean;
  twoFactorAuth: boolean;
  biometricLogin: boolean;
  savePaymentInfo: boolean;
}

const DEFAULT_SETTINGS: SettingsState = {
  pushNotifications: true,
  orderUpdates: true,
  promoEmails: false,
  twoFactorAuth: false,
  biometricLogin: false,
  savePaymentInfo: true,
};

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  const toggle = (key: keyof SettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => Alert.alert('Feature coming soon', 'Contact support to delete your account.'),
        },
      ]
    );
  };

  const notificationRows: SettingRow[] = [
    { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive app notifications', value: settings.pushNotifications },
    { key: 'orderUpdates', label: 'Order Updates', description: 'Shipping and delivery alerts', value: settings.orderUpdates },
    { key: 'promoEmails', label: 'Promotional Emails', description: 'Sales, new arrivals, offers', value: settings.promoEmails },
  ];

  const securityRows: SettingRow[] = [
    { key: 'twoFactorAuth', label: 'Two-Factor Auth', description: 'Extra sign-in security', value: settings.twoFactorAuth },
    { key: 'biometricLogin', label: 'Biometric Login', description: 'Face ID / fingerprint', value: settings.biometricLogin },
    { key: 'savePaymentInfo', label: 'Save Payment Info', description: 'Securely store card details', value: settings.savePaymentInfo },
  ];

  const renderToggleRow = (row: SettingRow) => (
    <View key={row.key} style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{row.label}</Text>
        {row.description && <Text style={styles.rowDesc}>{row.description}</Text>}
      </View>
      <Switch
        value={row.value}
        onValueChange={() => toggle(row.key as keyof SettingsState)}
        trackColor={{ false: '#1e293b', true: '#e94560' }}
        thumbColor="#f8fafc"
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.sectionCard}>
          {notificationRows.map(renderToggleRow)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security & Privacy</Text>
        <View style={styles.sectionCard}>
          {securityRows.map(renderToggleRow)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.linkLabel}>Edit Profile</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkLabel}>Privacy Policy</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkLabel}>Terms of Service</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.sectionCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>100</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
        <Text style={styles.deleteBtnText}>Delete Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 24,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
  },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 15, color: '#f8fafc', fontWeight: '500' },
  rowDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linkLabel: { fontSize: 15, color: '#f8fafc' },
  chevron: { fontSize: 20, color: '#475569' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoLabel: { fontSize: 14, color: '#94a3b8' },
  infoValue: { fontSize: 14, color: '#475569' },
  divider: { height: 1, backgroundColor: '#0f172a', marginHorizontal: 16 },
  deleteBtn: {
    backgroundColor: 'rgba(233,69,96,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(233,69,96,0.3)',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteBtnText: { color: '#e94560', fontWeight: '700', fontSize: 15 },
});
