import { afterEach, expect, test, vi } from 'vitest';
import { apiFetch } from '../src/lib/api';

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
