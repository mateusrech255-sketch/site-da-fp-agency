const DEFAULT_API_BASE = 'https://api.fpagency.com.br';

type EnvRecord = Record<string, string | undefined>;

function getRuntimeEnv(): EnvRecord {
  const viteEnv = import.meta.env as EnvRecord | undefined;
  const processEnv = typeof process !== 'undefined' ? process.env : undefined;
  return {
    ...processEnv,
    ...viteEnv,
  };
}

function cleanBaseUrl(value: unknown): string {
  const text = String(value || '').trim();
  return (text || DEFAULT_API_BASE).replace(/\/+$/, '');
}

function getInternalSecret(): string {
  return String(getRuntimeEnv().INTERNAL_SECRET || '').trim();
}

export function getApiBase(): string {
  return cleanBaseUrl(getRuntimeEnv().PUBLIC_API_BASE);
}

export function buildApiUrl(path: string): string {
  const cleanPath = String(path || '').trim();
  if (/^https?:\/\//i.test(cleanPath)) {
    throw new Error('apiFetch aceita apenas paths relativos da API.');
  }

  return `${getApiBase()}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
}

export async function apiRawFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const secret = getInternalSecret();
  if (!secret) {
    throw new Error('INTERNAL_SECRET ausente no ambiente SSR.');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${secret}`);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  return fetch(buildApiUrl(path), {
    ...init,
    headers,
  });
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiRawFetch(path, init);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`.trim());

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function proxyWorkerResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.delete('content-encoding');
  headers.delete('content-length');
  headers.set('Cache-Control', 'no-store');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function jsonError(message: string, status = 500): Response {
  return new Response(
    JSON.stringify({
      success: false,
      ok: false,
      found: false,
      msg: message,
    }),
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=UTF-8',
      },
    },
  );
}
