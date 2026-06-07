const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export interface CouponValidationResult {
  valid: boolean;
  discountCents: number;
  couponId: string;
  message?: string;
}

export async function validateCoupon(code: string, orderTotalCents: number): Promise<CouponValidationResult> {
  return apiFetch<CouponValidationResult>('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, orderTotalCents }),
  });
}
