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

export interface ReviewDto {
  id: string;
  userId: string;
  user?: { id: string; name: string };
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

export interface RatingDist {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export async function fetchProductReviews(productId: string): Promise<ReviewDto[]> {
  const data = await apiFetch<ReviewDto[]>(`/reviews?productId=${productId}`);
  return Array.isArray(data) ? data : [];
}

export async function fetchRatingDistribution(productId: string): Promise<RatingDist | null> {
  try {
    return await apiFetch<RatingDist>(`/reviews/distribution?productId=${productId}`);
  } catch {
    return null;
  }
}

export async function submitReview(dto: {
  orderId?: string;
  productId?: string;
  variantId?: string;
  rating: number;
  title?: string;
  body: string;
  tags?: string[];
}): Promise<ReviewDto> {
  return apiFetch<ReviewDto>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}
