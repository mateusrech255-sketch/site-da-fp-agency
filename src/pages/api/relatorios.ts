import type { APIRoute } from 'astro';
import { apiRawFetch, jsonError, proxyWorkerResponse } from '../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json().catch(() => ({}));
    const response = await apiRawFetch('/', {
      method: 'POST',
      body: JSON.stringify({
        action: 'buscarRelatorios',
        data,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return proxyWorkerResponse(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao consultar relatórios.';
    return jsonError(message);
  }
};
