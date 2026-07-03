import { afterEach, expect, test, vi } from 'vitest';

const apiRawFetchMock = vi.hoisted(() => vi.fn());

vi.mock('../src/lib/api', async () => {
  const actual = await vi.importActual<typeof import('../src/lib/api')>(
    '../src/lib/api',
  );

  return {
    ...actual,
    apiRawFetch: apiRawFetchMock,
    proxyWorkerResponse: (response: Response) => response,
  };
});

afterEach(() => {
  apiRawFetchMock.mockReset();
});

test('/api/buscar proxies GET lookup through the Worker', async () => {
  const { GET } = await import('../src/pages/api/buscar');

  apiRawFetchMock.mockResolvedValue(
    new Response(JSON.stringify({ ok: true, found: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  const response = await GET({
    url: new URL('http://localhost/api/buscar?codigo=66333'),
  } as Parameters<typeof GET>[0]);

  expect(response.status).toBe(200);
  expect(apiRawFetchMock).toHaveBeenCalledWith('/api/buscar?codigo=66333', {
    method: 'GET',
  });
});

test.each([
  {
    route: '/api/inscricao',
    modulePath: '../src/pages/api/inscricao',
    workerPath: '/api/inscricao',
    body: { action: 'cadastrarInscricaoPublica', data: { nome: 'Mateus' } },
  },
  {
    route: '/api/search',
    modulePath: '../src/pages/api/search',
    workerPath: '/',
    body: { action: 'buscarAprovacao', data: { termo: 'Mateus' } },
  },
  {
    route: '/api/worker',
    modulePath: '../src/pages/api/worker',
    workerPath: '/',
    body: { action: 'getDashboardData', data: { idToken: 'token' } },
  },
])('$route forwards body to Worker', async ({ route, modulePath, workerPath, body }) => {
  const { POST } = (await import(modulePath)) as {
    POST: (context: { request: Request }) => Response | Promise<Response>;
  };
  const rawBody = JSON.stringify(body);

  apiRawFetchMock.mockResolvedValue(
    new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  const response = await POST({
    request: new Request(`http://localhost${route}`, {
      method: 'POST',
      body: rawBody,
      headers: { 'Content-Type': 'application/custom-json' },
    }),
  });

  expect(response.status).toBe(200);
  expect(apiRawFetchMock).toHaveBeenCalledWith(
    workerPath,
    expect.objectContaining({
      method: 'POST',
      body: rawBody,
      headers: { 'Content-Type': 'application/custom-json' },
    }),
  );
});

test.each([
  {
    route: '/api/inscricao',
    modulePath: '../src/pages/api/inscricao',
    workerPath: '/api/inscricao',
  },
  {
    route: '/api/search',
    modulePath: '../src/pages/api/search',
    workerPath: '/',
  },
  {
    route: '/api/worker',
    modulePath: '../src/pages/api/worker',
    workerPath: '/',
  },
])('$route uses application/json when request content type is missing', async ({
  route,
  modulePath,
  workerPath,
}) => {
  const { POST } = (await import(modulePath)) as {
    POST: (context: { request: Request }) => Response | Promise<Response>;
  };

  apiRawFetchMock.mockResolvedValue(
    new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  const response = await POST({
    request: new Request(`http://localhost${route}`, {
      method: 'POST',
    }),
  });

  expect(response.status).toBe(200);
  expect(apiRawFetchMock).toHaveBeenCalledWith(
    workerPath,
    expect.objectContaining({
      body: '',
      headers: { 'Content-Type': 'application/json' },
    }),
  );
});

test('/api/relatorios proxies buscarRelatorios through the Worker', async () => {
  const { POST } = await import('../src/pages/api/relatorios');
  const payload = { termo: 'Mateus', filtro: 'all', page: 1, limit: 4 };

  apiRawFetchMock.mockResolvedValue(
    new Response(JSON.stringify({ success: true, data: [], total: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  const response = await POST({
    request: new Request('http://localhost/api/relatorios', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    }),
  } as Parameters<typeof POST>[0]);

  expect(response.status).toBe(200);
  expect(apiRawFetchMock).toHaveBeenCalledWith(
    '/',
    expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'buscarRelatorios',
        data: payload,
      }),
    }),
  );
});

test('/api/relatorios sends an empty object when the body is not JSON', async () => {
  const { POST } = await import('../src/pages/api/relatorios');

  apiRawFetchMock.mockResolvedValue(
    new Response(JSON.stringify({ success: true, data: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  const response = await POST({
    request: new Request('http://localhost/api/relatorios', {
      method: 'POST',
      body: 'invalid-json',
      headers: { 'Content-Type': 'application/json' },
    }),
  } as Parameters<typeof POST>[0]);

  expect(response.status).toBe(200);
  expect(apiRawFetchMock).toHaveBeenCalledWith(
    '/',
    expect.objectContaining({
      body: JSON.stringify({
        action: 'buscarRelatorios',
        data: {},
      }),
    }),
  );
});

test('/api/relatorios returns jsonError when proxying fails', async () => {
  const { POST } = await import('../src/pages/api/relatorios');
  apiRawFetchMock.mockRejectedValue(new Error('Worker fora do ar'));

  const response = await POST({
    request: new Request('http://localhost/api/relatorios', {
      method: 'POST',
      body: JSON.stringify({ termo: 'Mateus' }),
      headers: { 'Content-Type': 'application/json' },
    }),
  } as Parameters<typeof POST>[0]);

  expect(response.status).toBe(500);
  await expect(response.json()).resolves.toMatchObject({
    success: false,
    msg: 'Worker fora do ar',
  });
});

test('/api/relatorios returns the default message for non-Error failures', async () => {
  const { POST } = await import('../src/pages/api/relatorios');
  apiRawFetchMock.mockRejectedValue('falha bruta');

  const response = await POST({
    request: new Request('http://localhost/api/relatorios', {
      method: 'POST',
      body: '{}',
    }),
  } as Parameters<typeof POST>[0]);

  expect(response.status).toBe(500);
  await expect(response.json()).resolves.toMatchObject({
    success: false,
    msg: 'Falha ao consultar relatórios.',
  });
});

test.each([
  {
    label: '/api/buscar',
    load: async () => (await import('../src/pages/api/buscar')).GET,
    context: {
      url: new URL('http://localhost/api/buscar?codigo=66333'),
    },
  },
  {
    label: '/api/inscricao',
    load: async () => (await import('../src/pages/api/inscricao')).POST,
    context: {
      request: new Request('http://localhost/api/inscricao', {
        method: 'POST',
        body: '{}',
      }),
    },
  },
  {
    label: '/api/search',
    load: async () => (await import('../src/pages/api/search')).POST,
    context: {
      request: new Request('http://localhost/api/search', {
        method: 'POST',
        body: '{}',
      }),
    },
  },
  {
    label: '/api/worker',
    load: async () => (await import('../src/pages/api/worker')).POST,
    context: {
      request: new Request('http://localhost/api/worker', {
        method: 'POST',
        body: '{}',
      }),
    },
  },
])('$label returns jsonError when Worker proxy fails', async ({ load, context }) => {
  const handler = await load();
  apiRawFetchMock.mockRejectedValue('falha bruta');

  const response = await handler(context as never);

  expect(response.status).toBe(500);
  await expect(response.json()).resolves.toMatchObject({
    success: false,
    msg: expect.stringMatching(/Falha ao/),
  });
});

test.each([
  {
    label: '/api/buscar',
    load: async () => (await import('../src/pages/api/buscar')).GET,
    context: {
      url: new URL('http://localhost/api/buscar?codigo=66333'),
    },
  },
  {
    label: '/api/inscricao',
    load: async () => (await import('../src/pages/api/inscricao')).POST,
    context: {
      request: new Request('http://localhost/api/inscricao', {
        method: 'POST',
        body: '{}',
      }),
    },
  },
  {
    label: '/api/search',
    load: async () => (await import('../src/pages/api/search')).POST,
    context: {
      request: new Request('http://localhost/api/search', {
        method: 'POST',
        body: '{}',
      }),
    },
  },
  {
    label: '/api/worker',
    load: async () => (await import('../src/pages/api/worker')).POST,
    context: {
      request: new Request('http://localhost/api/worker', {
        method: 'POST',
        body: '{}',
      }),
    },
  },
])('$label forwards Error messages when Worker proxy throws', async ({ load, context }) => {
  const handler = await load();
  apiRawFetchMock.mockRejectedValue(new Error('Worker indisponível'));

  const response = await handler(context as never);

  expect(response.status).toBe(500);
  await expect(response.json()).resolves.toMatchObject({
    success: false,
    msg: 'Worker indisponível',
  });
});
