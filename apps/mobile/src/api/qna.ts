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

export interface QnAItem {
  id: string;
  question: string;
  answer: string | null;
  askedBy?: string;
  answeredAt?: string | null;
  createdAt: string;
}

export async function fetchProductQnA(productId: string): Promise<QnAItem[]> {
  const data = await apiFetch<QnAItem[]>(`/qna?productId=${productId}`);
  return Array.isArray(data) ? data : [];
}

export async function askQuestion(productId: string, question: string): Promise<QnAItem> {
  return apiFetch<QnAItem>('/qna/ask', {
    method: 'POST',
    body: JSON.stringify({ productId, question }),
  });
}
