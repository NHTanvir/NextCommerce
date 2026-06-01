import type { OrderDto } from '@nextcommerce/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

async function apiFetch<T>(path_: string, init?: RequestInit, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path_}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function fetchOrders(token: string): Promise<OrderDto[]> {
  return apiFetch<OrderDto[]>('/orders', {}, token);
}

export async function fetchOrder(id: string, token: string): Promise<OrderDto> {
  return apiFetch<OrderDto>(`/orders/${id}`, {}, token);
}
