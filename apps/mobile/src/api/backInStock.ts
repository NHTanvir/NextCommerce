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
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface BackInStockSub {
  id: string;
  productId: string;
  variantId: string;
  notified: boolean;
  notifiedAt: string | null;
  createdAt: string;
  variant?: {
    size?: number;
    color?: string;
    sku?: string;
    stockQty: number;
  };
  product?: {
    title: string;
    brand: string;
    slug: string;
    images?: Array<{ url: string }>;
  };
}

export async function fetchBackInStockSubs(): Promise<BackInStockSub[]> {
  const data = await apiFetch<BackInStockSub[]>('/back-in-stock');
  return Array.isArray(data) ? data : [];
}

export async function subscribeBackInStock(productId: string, variantId: string): Promise<BackInStockSub> {
  return apiFetch<BackInStockSub>('/back-in-stock', {
    method: 'POST',
    body: JSON.stringify({ productId, variantId }),
  });
}

export async function removeBackInStockSub(id: string): Promise<void> {
  await apiFetch(`/back-in-stock/${id}`, { method: 'DELETE' });
}
