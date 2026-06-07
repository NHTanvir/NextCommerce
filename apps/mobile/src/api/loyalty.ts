import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('auth_token');
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

export interface LoyaltyBalance {
  points: number;
  tier: string;
  lifetimePoints: number;
  nextTierPoints: number | null;
}

export interface LoyaltyTransaction {
  id: string;
  type: 'earn' | 'redeem' | 'bonus' | 'expire' | 'refund';
  points: number;
  description: string;
  createdAt: string;
}

export async function fetchLoyaltyBalance(): Promise<LoyaltyBalance> {
  return apiFetch<LoyaltyBalance>('/loyalty/balance');
}

export async function fetchLoyaltyHistory(limit = 20): Promise<LoyaltyTransaction[]> {
  return apiFetch<LoyaltyTransaction[]>(`/loyalty/history?limit=${limit}`);
}

export async function redeemLoyaltyPoints(points: number): Promise<{ discountCents: number }> {
  return apiFetch<{ discountCents: number }>('/loyalty/redeem', {
    method: 'POST',
    body: JSON.stringify({ points }),
  });
}
