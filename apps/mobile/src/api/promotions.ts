const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export async function fetchActivePromotions(): Promise<Promotion[]> {
  return apiFetch<Promotion[]>('/promotions/active');
}
