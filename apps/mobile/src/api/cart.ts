import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
const CART_TOKEN_KEY = 'nc_cart_token';

async function getAuthToken(): Promise<string | null> {
  try {
    return (await AsyncStorage.getItem('auth_token')) ?? (await AsyncStorage.getItem('nc_token'));
  } catch {
    return null;
  }
}

async function getCartToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CART_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function setCartToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CART_TOKEN_KEY, token);
  } catch {
    // swallow — anonymous cart still works for the current process via response header
  }
}

export interface CartItemDto {
  id: string;
  variantId: string;
  quantity: number;
  unitPriceCents: number;
  product: {
    id: string;
    slug: string;
    title: string;
    brand: string;
  };
  variant: {
    id: string;
    size: number;
    color: string;
    sku: string;
  };
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  totalCents: number;
}

export async function addToCart(input: { variantId: string; quantity: number }): Promise<CartDto> {
  const [authToken, cartToken] = await Promise.all([getAuthToken(), getCartToken()]);

  const res = await fetch(`${API_URL}/api/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(cartToken ? { 'x-cart-token': cartToken } : {}),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}) as { message?: string });
    throw new Error(err.message ?? `Failed to add to cart (${res.status})`);
  }

  const issuedToken = res.headers.get('x-cart-token');
  if (issuedToken && issuedToken !== cartToken) {
    await setCartToken(issuedToken);
  }

  return (await res.json()) as CartDto;
}
