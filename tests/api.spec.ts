import { afterEach, expect, test, vi } from 'vitest';
import {
  apiFetch,
  apiRawFetch,
  buildApiUrl,
  jsonError,
  proxyWorkerResponse,
} from '../src/lib/api';

const SECRET = 'test-internal-secret';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test('buscar codigo valido', async () => {
  vi.stubEnv('INTERNAL_SECRET', SECRET);
  vi.stubEnv('PUBLIC_API_BASE', 'https://api.fpagency.com.br');

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    expect(String(input)).toBe('https://api.fpagency.com.br/api/buscar?codigo=66333');

    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe(`Bearer ${SECRET}`);
    expect(headers.get('Content-Type')).toBe('application/json');

    return new Response(JSON.stringify({ ok: true, found: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  vi.stubGlobal('fetch', fetchMock);

  const result = await apiFetch<{ ok: boolean; found: boolean }>(
    '/api/buscar?codigo=66333',
  );

  expect(result.ok).toBe(true);
  expect(result.found).toBe(true);
  expect(fetchMock).toHaveBeenCalledOnce();
});

test('apiRawFetch rejects missing server secret', async () => {
  vi.stubEnv('INTERNAL_SECRET', '');

  await expect(apiRawFetch('/api/buscar')).rejects.toThrow(
    'INTERNAL_SECRET ausente',
  );
});

test('buildApiUrl accepts only relative API paths', () => {
  vi.stubEnv('PUBLIC_API_BASE', 'https://api.fpagency.com.br/');

  expect(buildApiUrl('/api/buscar')).toBe('https://api.fpagency.com.br/api/buscar');
  expect(() => buildApiUrl('https://example.com/api')).toThrow(
    'apiFetch aceita apenas paths relativos',
  );
});

test('apiFetch throws on non-ok response', async () => {
  vi.stubEnv('INTERNAL_SECRET', SECRET);
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('Nope', { status: 500, statusText: 'Bad' })),
  );

  await expect(apiFetch('/api/buscar')).rejects.toThrow('500 Bad');
});

test('apiFetch preserves caller content type and handles empty responses', async () => {
  vi.stubEnv('INTERNAL_SECRET', SECRET);

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    expect(String(input)).toBe('https://api.fpagency.com.br/api/ping');

    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe(`Bearer ${SECRET}`);
    expect(headers.get('Content-Type')).toBe('text/plain');

    return new Response(null, { status: 204, statusText: 'No Content' });
  });

  vi.stubGlobal('fetch', fetchMock);

  await expect(
    apiFetch<void>('api/ping', {
      headers: {
        'Content-Type': 'text/plain',
      },
    }),
  ).resolves.toBeUndefined();
});

test('buildApiUrl falls back to the production base when env base is blank', async () => {
  vi.resetModules();
  vi.stubEnv('PUBLIC_API_BASE', '');

  const freshApi = await import('../src/lib/api');

  expect(freshApi.buildApiUrl('/api/buscar')).toBe(
    'https://api.fpagency.com.br/api/buscar',
  );
});

test('proxyWorkerResponse strips encoded body headers and disables cache', async () => {
  const proxied = proxyWorkerResponse(
    new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: {
        'Content-Encoding': 'gzip',
        'Content-Length': '999',
        'Content-Type': 'application/json',
      },
    }),
  );

  expect(proxied.status).toBe(201);
  expect(proxied.headers.get('Content-Encoding')).toBeNull();
  expect(proxied.headers.get('Content-Length')).toBeNull();
  expect(proxied.headers.get('Cache-Control')).toBe('no-store');
  await expect(proxied.json()).resolves.toEqual({ success: true });
});

test('jsonError returns the shared proxy error shape', async () => {
  const response = jsonError('Falhou', 502);

  expect(response.status).toBe(502);
  await expect(response.json()).resolves.toEqual({
    success: false,
    ok: false,
    found: false,
    msg: 'Falhou',
  });
});
