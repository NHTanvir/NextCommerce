import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('nc_token') ?? await AsyncStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface GiftCard {
  id: string;
  code: string;
  initialAmountCents: number;
  remainingAmountCents: number;
  isActive: boolean;
  recipientEmail: string | null;
  recipientName: string | null;
  message: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface GiftCardBalance {
  code: string;
  remaining: number;
  isValid: boolean;
  expiresAt: string | null;
}

export async function purchaseGiftCard(dto: {
  amountCents: number;
  recipientEmail?: string;
  recipientName?: string;
  message?: string;
}): Promise<GiftCard> {
  return apiFetch<GiftCard>('/gift-cards/purchase', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function checkGiftCardBalance(code: string): Promise<GiftCardBalance> {
  return apiFetch<GiftCardBalance>(`/gift-cards/balance?code=${encodeURIComponent(code)}`);
}

export async function fetchMyGiftCards(): Promise<GiftCard[]> {
  return apiFetch<GiftCard[]>('/gift-cards/my');
}

export async function applyGiftCard(code: string, orderAmountCents: number): Promise<{ discountCents: number; remainingAfter: number }> {
  return apiFetch('/gift-cards/apply', {
    method: 'POST',
    body: JSON.stringify({ code, orderAmountCents }),
  });
}
