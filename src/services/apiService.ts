import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/api';
import { authStorageKeys } from '../context/AuthContext';
import {
  createRequestId,
  logApiError,
  logApiRequest,
  logApiResponse,
  recordApiTrace,
} from '../lib/devLog';

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

async function getToken(kind: 'user' | 'partner' | 'admin'): Promise<string | null> {
  let raw: string | null = null;
  if (kind === 'user') raw = await AsyncStorage.getItem(authStorageKeys.userToken);
  else if (kind === 'partner') raw = await AsyncStorage.getItem(authStorageKeys.partnerToken);
  const t = raw?.trim();
  return t && t.length ? t : null;
}

async function requestJson<T>(
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  body?: unknown,
  auth?: 'user' | 'partner' | 'admin',
): Promise<T> {
  const requestId = createRequestId();
  const url = `${BASE_URL}${path}`;
  const token = auth ? await getToken(auth) : null;
  const start = Date.now();

  logApiRequest({
    requestId,
    method,
    url,
    path,
    auth,
    hasToken: Boolean(token),
    token,
    body,
  });

  let res: Response;
  let text = '';
  try {
    res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
        ...(token ? { Authorization: `Bearer ${token}` } : null),
      },
      body: body == null ? undefined : JSON.stringify(body),
    });
    text = await res.text();
  } catch (e: unknown) {
    const durationMs = Date.now() - start;
    const error = e instanceof Error ? e.message : 'Network request failed';
    logApiError({ requestId, method, path, durationMs, error });
    recordApiTrace({
      requestId,
      method,
      url,
      path,
      auth,
      hasToken: Boolean(token),
      tokenPreview: token ?? undefined,
      requestBody: body,
      responseStatus: 0,
      durationMs,
      ok: false,
      error,
    });
    throw new Error(error);
  }

  const durationMs = Date.now() - start;
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text ? { _raw: text.slice(0, 500) } : null;
  }

  const responseForLog =
    json && typeof json === 'object' ? json : text ? { _raw: text.slice(0, 500) } : null;

  if (!res.ok) {
    const envelope = json as { message?: string; error?: string } | null;
    const msg = (envelope && (envelope.message || envelope.error)) || `HTTP ${res.status}`;
    logApiError({
      requestId,
      method,
      path,
      durationMs,
      error: msg,
      status: res.status,
      body: responseForLog,
    });
    recordApiTrace({
      requestId,
      method,
      url,
      path,
      auth,
      hasToken: Boolean(token),
      tokenPreview: token ?? undefined,
      requestBody: body,
      responseStatus: res.status,
      responseBody: responseForLog,
      durationMs,
      ok: false,
      error: msg,
    });
    throw new Error(msg);
  }

  logApiResponse({
    requestId,
    method,
    path,
    status: res.status,
    durationMs,
    body: responseForLog,
  });

  recordApiTrace({
    requestId,
    method,
    url,
    path,
    auth,
    hasToken: Boolean(token),
    tokenPreview: token ?? undefined,
    requestBody: body,
    responseStatus: res.status,
    responseBody: responseForLog,
    durationMs,
    ok: true,
  });

  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    const env = json as ApiEnvelope<T>;
    if (env.success === false) {
      const errMsg = env.message || 'Request failed';
      recordApiTrace({
        requestId,
        method,
        url,
        path,
        auth,
        hasToken: Boolean(token),
        requestBody: body,
        responseStatus: res.status,
        responseBody: responseForLog,
        durationMs,
        ok: false,
        error: errMsg,
      });
      throw new Error(errMsg);
    }
    return env.data;
  }

  return json as T;
}

export const apiService = {
  baseUrl: BASE_URL,

  health() {
    return requestJson<{ status: 'ok' }>('GET', '/health');
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
