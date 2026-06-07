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

export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    slug: string;
    title: string;
    brand: string;
    basePriceCents: number;
  };
  addedAt: string;
}

export async function fetchWishlist(): Promise<WishlistItem[]> {
  return apiFetch<WishlistItem[]>('/wishlist');
}

export async function addToWishlist(productId: string): Promise<WishlistItem> {
  return apiFetch<WishlistItem>('/wishlist', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
}

export async function removeFromWishlist(productId: string): Promise<void> {
  await apiFetch(`/wishlist/${productId}`, { method: 'DELETE' });
}
