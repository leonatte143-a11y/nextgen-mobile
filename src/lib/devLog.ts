/**
 * Development-only logging and API trace ring buffer for Expo Go debugging.
 */

export const IS_DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'authorization',
  'otp',
  'debugotp',
  'jwt',
  'secret',
]);

export type ApiTraceEntry = {
  id: string;
  requestId: string;
  method: string;
  url: string;
  path: string;
  auth?: string;
  hasToken: boolean;
  tokenPreview?: string;
  requestBody?: unknown;
  responseStatus: number;
  responseBody?: unknown;
  durationMs: number;
  ok: boolean;
  error?: string;
  at: string;
};

const MAX_HISTORY = 40;
const apiHistory: ApiTraceEntry[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  });
}

export function subscribeApiHistory(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getApiHistory(): readonly ApiTraceEntry[] {
  return apiHistory;
}

export function clearApiHistory() {
  apiHistory.length = 0;
  notify();
}

function pushApi(entry: ApiTraceEntry) {
  apiHistory.unshift(entry);
  if (apiHistory.length > MAX_HISTORY) apiHistory.pop();
  notify();
}

export function createRequestId(): string {
  return `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function maskValue(key: string, value: unknown): unknown {
  if (value == null) return value;
  const k = key.toLowerCase();
  if (SENSITIVE_KEYS.has(k) || k.includes('token')) {
    if (typeof value === 'string' && value.length > 8) {
      return `${value.slice(0, 4)}…${value.slice(-4)}`;
    }
    return '***';
  }
  if (k === 'phone' && typeof value === 'string') {
    const d = value.replace(/\D/g, '');
    if (d.length >= 4) return `***${d.slice(-4)}`;
  }
  return value;
}

export function maskPayload(obj: unknown, depth = 0): unknown {
  if (depth > 4) return '[max depth]';
  if (obj == null) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((v) => maskPayload(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      out[k] = maskPayload(v, depth + 1);
    } else {
      out[k] = maskValue(k, v);
    }
  }
  return out;
}

function previewToken(token: string | null | undefined): string | undefined {
  if (!token) return undefined;
  if (token.length <= 12) return '***';
  return `${token.slice(0, 6)}…${token.slice(-4)}`;
}

function logBlock(title: string, payload?: unknown) {
  if (!IS_DEV) return;
  // eslint-disable-next-line no-console
  console.log(`\n[${title}]`);
  if (payload !== undefined) {
    // eslint-disable-next-line no-console
    console.log(typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2));
  }
}

export function logScreen(name: string) {
  if (!IS_DEV) return;
  logBlock('SCREEN', `${name} opened`);
}

export function logAction(action: string, meta?: Record<string, unknown>) {
  if (!IS_DEV) return;
  const masked = meta ? (maskPayload(meta) as Record<string, unknown>) : undefined;
  logBlock('ACTION', masked ? { action, ...masked } : action);
}

export function logAuth(event: string, meta?: Record<string, unknown>) {
  if (!IS_DEV) return;
  logBlock('AUTH', { event, ...(meta ? (maskPayload(meta) as object) : {}) });
}

export function logNav(from: string | undefined, to: string | undefined) {
  if (!IS_DEV) return;
  logBlock('NAV', { from: from ?? '—', to: to ?? '—' });
}

export function logApiRequest(params: {
  requestId: string;
  method: string;
  url: string;
  path: string;
  auth?: string;
  hasToken: boolean;
  token?: string | null;
  body?: unknown;
}) {
  if (!IS_DEV) return;
  logBlock('API REQUEST', `${params.method} ${params.path}`);
  logBlock('REQUEST ID', params.requestId);
  if (params.auth) {
    logBlock('AUTH HEADER', { role: params.auth, token: previewToken(params.token) });
  }
  if (params.body !== undefined) {
    logBlock('REQUEST BODY', maskPayload(params.body));
  }
}

export function logApiResponse(params: {
  requestId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  body?: unknown;
}) {
  if (!IS_DEV) return;
  const ok = params.status >= 200 && params.status < 300;
  logBlock('API RESPONSE', `${params.status} ${ok ? 'OK' : 'FAIL'} — ${params.method} ${params.path}`);
  logBlock('REQUEST ID', params.requestId);
  logBlock('API TIME', `${params.durationMs}ms`);
  if (params.body !== undefined) {
    logBlock('RESPONSE BODY', maskPayload(params.body));
  }
}

export function logApiError(params: {
  requestId: string;
  method: string;
  path: string;
  durationMs: number;
  error: string;
  status?: number;
  body?: unknown;
}) {
  if (!IS_DEV) return;
  logBlock('API ERROR', params.error);
  logBlock('REQUEST ID', params.requestId);
  logBlock('API TIME', `${params.durationMs}ms`);
  if (params.status != null) logBlock('STATUS', params.status);
  if (params.body !== undefined) logBlock('RESPONSE BODY', maskPayload(params.body));
}

export function recordApiTrace(entry: Omit<ApiTraceEntry, 'id' | 'at'>) {
  if (!IS_DEV) return;
  pushApi({
    ...entry,
    id: `${entry.requestId}-${entry.durationMs}`,
    at: new Date().toISOString(),
    requestBody: entry.requestBody != null ? maskPayload(entry.requestBody) : undefined,
    responseBody: entry.responseBody != null ? maskPayload(entry.responseBody) : undefined,
    tokenPreview: previewToken(entry.tokenPreview ?? null),
  });
}
