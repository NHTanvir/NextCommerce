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
import { register } from '../api/auth';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Valid email required';
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      Alert.alert('Account Created!', 'Welcome to NextCommerce.', [
        { text: 'Continue Shopping', onPress: () => navigation.navigate('ProductList') },
      ]);
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.message ?? 'Something went wrong. Please try again.');
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join NextCommerce and shop the best kicks.</Text>

        <View style={styles.form}>
          {(['name', 'email', 'password'] as const).map((field) => (
            <View key={field} style={styles.field}>
              <Text style={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
              <TextInput
                style={[styles.input, errors[field] ? styles.inputError : null]}
                value={field === 'name' ? name : field === 'email' ? email : password}
                onChangeText={field === 'name' ? setName : field === 'email' ? setEmail : setPassword}
                placeholder={
                  field === 'name' ? 'John Doe' : field === 'email' ? 'you@example.com' : '••••••••'
                }
                placeholderTextColor="#6b7280"
                keyboardType={field === 'email' ? 'email-address' : 'default'}
                autoCapitalize={field === 'name' ? 'words' : 'none'}
                secureTextEntry={field === 'password'}
                returnKeyType={field === 'password' ? 'done' : 'next'}
                onSubmitEditing={field === 'password' ? handleRegister : undefined}
              />
              {errors[field] ? <Text style={styles.errorMsg}>{errors[field]}</Text> : null}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.submitBtn, loading ? styles.submitBtnDisabled : null]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f17' },
  scroll: { padding: 24, flexGrow: 1, justifyContent: 'center' },
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
