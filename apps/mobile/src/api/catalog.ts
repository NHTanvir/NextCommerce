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

export async function fetchTrending(limit = 12): Promise<{ products: ProductDto[] }> {
  return apiFetch<{ products: ProductDto[] }>(`/trending?limit=${limit}`);
}

export async function fetchNewArrivals(days = 30, limit = 20): Promise<ProductDto[]> {
  return apiFetch<ProductDto[]>(`/new-arrivals?days=${days}&limit=${limit}`);
}

export async function fetchDeals(limit = 20): Promise<{ data: (ProductDto & { discountPct: number })[]; total: number }> {
  return apiFetch(`/deals?limit=${limit}`);
}

export async function fetchSearchSuggestions(q: string, limit = 8): Promise<Array<{ id: string; slug: string; title: string; brand: string; priceCents: number }>> {
  return apiFetch(`/search/suggestions?q=${encodeURIComponent(q)}&limit=${limit}`);
}

export async function fetchCategories(): Promise<Array<{ id: string; slug: string; name: string }>> {
  return apiFetch('/categories');
}
