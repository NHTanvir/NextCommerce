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
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export interface PriceAlert {
  id: string;
  productId: string;
  targetPriceCents: number | null;
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
  product?: {
    title: string;
    brand: string;
    basePriceCents: number;
    salePriceCents?: number | null;
    slug: string;
  };
}

export async function fetchPriceAlerts(): Promise<PriceAlert[]> {
  const data = await apiFetch<PriceAlert[]>('/price-alerts');
  return Array.isArray(data) ? data : [];
}

export async function deletePriceAlert(id: string): Promise<void> {
  await apiFetch(`/price-alerts/${id}`, { method: 'DELETE' });
}

export async function updatePriceAlert(id: string, targetPriceCents: number | null): Promise<PriceAlert> {
  return apiFetch<PriceAlert>(`/price-alerts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ targetPriceCents }),
  });
}
