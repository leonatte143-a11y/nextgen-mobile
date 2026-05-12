import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/api';
import { authStorageKeys } from '../context/AuthContext';

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

async function getToken(kind: 'user' | 'partner' | 'admin'): Promise<string | null> {
  if (kind === 'user') return AsyncStorage.getItem(authStorageKeys.userToken);
  if (kind === 'partner') return AsyncStorage.getItem(authStorageKeys.partnerToken);
  return null;
}

async function requestJson<T>(
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  body?: unknown,
  auth?: 'user' | 'partner' | 'admin',
): Promise<T> {
  const token = auth ? await getToken(auth) : null;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : null),
    },
    body: body == null ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    const msg = (json && (json.message || json.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // server uses { success, data, message }
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    const env = json as ApiEnvelope<T>;
    if (env.success === false) throw new Error(env.message || 'Request failed');
    return env.data;
  }

  return json as T;
}

export const apiService = {
  baseUrl: BASE_URL,

  health() {
    return requestJson<{ status: 'ok' }> ('GET', '/health');
  },

  get<T>(path: string, auth?: 'user' | 'partner' | 'admin') {
    return requestJson<T>('GET', path, undefined, auth);
  },

  post<T>(path: string, body?: unknown, auth?: 'user' | 'partner' | 'admin') {
    return requestJson<T>('POST', path, body, auth);
  },

  put<T>(path: string, body?: unknown, auth?: 'user' | 'partner' | 'admin') {
    return requestJson<T>('PUT', path, body, auth);
  },
};

