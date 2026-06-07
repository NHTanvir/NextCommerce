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
  return res.json() as Promise<T>;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  reason: string;
  status: string;
  createdAt: string;
}

export async function submitReturnRequest(dto: {
  orderId: string;
  reason: string;
  itemIds?: string[];
  notes?: string;
}): Promise<ReturnRequest> {
  return apiFetch<ReturnRequest>('/returns', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}
