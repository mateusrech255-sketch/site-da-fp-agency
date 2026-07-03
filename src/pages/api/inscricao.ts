import type { APIRoute } from 'astro';
import { apiRawFetch, jsonError, proxyWorkerResponse } from '../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text();
    const response = await apiRawFetch('/api/inscricao', {
      method: 'POST',
      body,
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
      },
    });

    return proxyWorkerResponse(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao enviar inscrição.';
    return jsonError(message);
  }
};
