import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { login } from '../api/auth';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const result = await login(email.trim(), password);
      Alert.alert('Welcome back!', `Signed in as ${result.user?.name ?? email}`, [
        { text: 'OK', onPress: () => navigation.navigate('ProductList') },
      ]);
    } catch (err: any) {
      Alert.alert('Sign In Failed', err?.message ?? 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Text style={styles.logoText}>Next</Text>
          <Text style={styles.logoAccent}>Commerce</Text>
        </View>

        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Welcome back. Sign in to your account.</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
            />
            {errors.email ? <Text style={styles.errorMsg}>{errors.email}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#6b7280"
              secureTextEntry
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            {errors.password ? <Text style={styles.errorMsg}>{errors.password}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading ? styles.submitBtnDisabled : null]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f17' },
  scroll: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  logo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  logoAccent: { color: '#e94560', fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { color: '#d1d5db', fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2d2d44',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 15,
  },
  inputError: { borderColor: '#e94560' },
  errorMsg: { color: '#e94560', fontSize: 12 },
  submitBtn: {
    backgroundColor: '#e94560',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: { color: '#9ca3af', fontSize: 14 },
  footerLink: { color: '#e94560', fontSize: 14, fontWeight: '600' },
});
