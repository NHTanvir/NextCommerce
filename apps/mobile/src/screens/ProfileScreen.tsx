import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<AccountStackParamList, 'Profile'>;

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const [user] = useState<{ name: string; email: string } | null>(null);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          navigation.navigate('Login');
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    {
      icon: '📦',
      label: 'My Orders',
      onPress: () => Alert.alert('Navigate', 'Go to Orders tab'),
    },
    {
      icon: '⭐',
      label: 'Loyalty Rewards',
      onPress: () => navigation.navigate('Loyalty'),
    },
    {
      icon: '🎁',
      label: 'Gift Cards',
      onPress: () => navigation.navigate('GiftCards'),
    },
    {
      icon: '👥',
      label: 'Refer a Friend',
      onPress: () => navigation.navigate('Referrals'),
    },
    {
      icon: '🔔',
      label: 'Notifications',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      icon: '⚙️',
      label: 'Account Settings',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: '📍',
      label: 'Find a Store',
      onPress: () => navigation.navigate('StoreLocator'),
    },
    {
      icon: '💬',
      label: 'Help & Support',
      onPress: () => navigation.navigate('Help'),
    },
    {
      icon: '🚪',
      label: 'Sign Out',
      onPress: handleSignOut,
      danger: true,
    },
  ];

  if (!user) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestIcon}>👤</Text>
        <Text style={styles.guestTitle}>You're not signed in</Text>
        <Text style={styles.guestSubtitle}>Sign in to view your profile, orders, and more.</Text>
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.signInBtnText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createAccountBtn}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.createAccountBtnText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, item.danger ? styles.menuItemDanger : null]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.menuLabel, item.danger ? styles.menuLabelDanger : null]}>
              {item.label}
            </Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.version}>NextCommerce v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f17' },
  content: { padding: 16, paddingBottom: 40 },
  guestContainer: {
    flex: 1,
    backgroundColor: '#0f0f17',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  guestIcon: { fontSize: 64, marginBottom: 8 },
  guestTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  guestSubtitle: { color: '#9ca3af', textAlign: 'center', fontSize: 14 },
  signInBtn: {
    backgroundColor: '#e94560',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  signInBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  createAccountBtn: {
    borderWidth: 1,
    borderColor: '#2d2d44',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  createAccountBtnText: { color: '#d1d5db', fontWeight: '600', fontSize: 16 },
  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e94560',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  userName: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  userEmail: { color: '#9ca3af', fontSize: 14 },
  menu: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d2d44',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  menuItemDanger: {},
  menuIcon: { fontSize: 20, marginRight: 12, width: 28, textAlign: 'center' },
  menuLabel: { flex: 1, color: '#d1d5db', fontSize: 15 },
  menuLabelDanger: { color: '#e94560' },
  menuArrow: { color: '#4b5563', fontSize: 20 },
  version: { color: '#374151', fontSize: 12, textAlign: 'center', marginTop: 24 },
});
