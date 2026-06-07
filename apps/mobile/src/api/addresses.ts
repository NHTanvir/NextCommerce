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
  const res = await fetch(`${API_URL}/api${path}`, {
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
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface Address {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  country: string;
  postalCode: string;
}

export async function fetchAddresses(): Promise<Address[]> {
  const data = await apiFetch<Address[]>('/addresses');
  return Array.isArray(data) ? data : [];
}

export async function createAddress(dto: {
  line1: string;
  line2?: string;
  city: string;
  country: string;
  postalCode: string;
}): Promise<Address> {
  return apiFetch<Address>('/addresses', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function deleteAddress(id: string): Promise<void> {
  await apiFetch(`/addresses/${id}`, { method: 'DELETE' });
}
