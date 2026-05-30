import type { ProductListResponse, ProductDto } from '@nextcommerce/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ProductListResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.search) qs.set('search', params.search);
  return apiFetch<ProductListResponse>(`/products?${qs}`);
}

export async function fetchProduct(slug: string): Promise<ProductDto> {
  return apiFetch<ProductDto>(`/products/${slug}`);
}
