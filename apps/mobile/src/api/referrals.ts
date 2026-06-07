import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('auth_token') ?? await AsyncStorage.getItem('nc_token');
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export interface ReferralStats {
  code: string | null;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
}

export interface ReferralHistory {
  id: string;
  status: 'pending' | 'completed' | 'paid';
  rewardPointsGranted: number | null;
  createdAt: string;
}

export async function fetchReferralStats(): Promise<ReferralStats> {
  return apiFetch<ReferralStats>('/referrals/stats');
}

export async function fetchReferralHistory(): Promise<ReferralHistory[]> {
  return apiFetch<ReferralHistory[]>('/referrals/history');
}

export async function applyReferralCode(code: string): Promise<void> {
  await apiFetch('/referrals/apply', { method: 'POST', body: JSON.stringify({ code }) });
}
