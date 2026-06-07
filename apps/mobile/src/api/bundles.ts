const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface BundleProduct {
  id: string;
  title: string;
  brand: string;
  slug: string;
  basePriceCents: number;
  salePriceCents?: number | null;
  images?: Array<{ url: string }>;
}

export interface Bundle {
  id: string;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  products: BundleProduct[];
}

export async function fetchBundles(): Promise<Bundle[]> {
  const res = await fetch(`${API_URL}/bundles`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
