import { afterEach, expect, test, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { publicApiUrls } from '../src/config/public-api';

const SECRET = 'test-internal-secret';

afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test('/api/worker reports missing INTERNAL_SECRET for the recruiter portal proxy', async () => {
  vi.stubEnv('INTERNAL_SECRET', '');

  const { POST } = await import('../src/pages/api/worker');
  const response = await POST({
    request: new Request('http://localhost/api/worker', {
      method: 'POST',
      body: JSON.stringify({ action: 'getDashboardData', data: { idToken: 'token' } }),
      headers: { 'Content-Type': 'application/json' },
    }),
  } as Parameters<typeof POST>[0]);

  expect(response.status).toBe(500);
  await expect(response.json()).resolves.toMatchObject({
    success: false,
    msg: 'INTERNAL_SECRET ausente no ambiente SSR.',
  });
});

test('/api/worker forwards recruiter portal requests when INTERNAL_SECRET exists', async () => {
  vi.stubEnv('INTERNAL_SECRET', SECRET);
  vi.stubEnv('PUBLIC_API_BASE', 'https://api.fpagency.com.br');

  const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe(`Bearer ${SECRET}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  vi.stubGlobal('fetch', fetchMock);

  const { POST } = await import('../src/pages/api/worker');
  const response = await POST({
    request: new Request('http://localhost/api/worker', {
      method: 'POST',
      body: JSON.stringify({ action: 'getDashboardData', data: { idToken: 'token' } }),
      headers: { 'Content-Type': 'application/json' },
    }),
  } as Parameters<typeof POST>[0]);

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ success: true });
  expect(fetchMock).toHaveBeenCalledOnce();
});

test('/recrutador is wired to show the proxy error message in the access modal', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/pages/recrutador.astro'), 'utf8');

  expect(publicApiUrls.recruiter).toBe('/api/worker');
  expect(source).toContain('data-api-url={recruiterApiUrl}');
  expect(source).toContain("globalAlert('Acesso Negado', res.msg, 'error')");
});

test('local dev and preview scripts load .env into the Node SSR runtime', () => {
  const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
    scripts: Record<string, string>;
  };

  for (const scriptName of ['dev', 'dev:astro', 'preview']) {
    const script = pkg.scripts[scriptName];

    expect(script).toContain('[ ! -f .env ] || . ./.env');
    expect(script).toContain('process.env.INTERNAL_SECRET ?');
    expect(script).not.toContain('36a10466840fdf752327206541eb455e215426377873033846b846055e53beef');
  }

  expect(pkg.scripts['dev:stop']).toBe('astro dev stop');
});
