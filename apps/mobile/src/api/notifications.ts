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

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export async function fetchNotifications(limit = 50): Promise<Notification[]> {
  const data = await apiFetch<Notification[] | { data: Notification[] }>(`/notifications?limit=${limit}`);
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function fetchUnreadCount(): Promise<number> {
  const data = await apiFetch<{ count: number }>('/notifications/unread-count');
  return data.count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch('/notifications/read-all', { method: 'PATCH' });
}
