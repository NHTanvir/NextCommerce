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

export interface QnAAnswer {
  id: string;
  body: string;
  isAdminAnswer: boolean;
  userId: string;
  createdAt: string;
}

export interface QnAQuestion {
  id: string;
  productId: string;
  userId: string;
  body: string;
  isAnswered: boolean;
  isHidden: boolean;
  answers: QnAAnswer[];
  createdAt: string;
}

export async function fetchProductQnA(productId: string): Promise<QnAQuestion[]> {
  const data = await apiFetch<QnAQuestion[]>(`/qna?productId=${productId}`);
  return Array.isArray(data) ? data : [];
}

export async function askQuestion(productId: string, body: string): Promise<QnAQuestion> {
  return apiFetch<QnAQuestion>('/qna/ask', {
    method: 'POST',
    body: JSON.stringify({ productId, body }),
  });
}
