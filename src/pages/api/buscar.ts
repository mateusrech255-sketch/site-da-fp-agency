import type { APIRoute } from 'astro';
import { apiRawFetch, jsonError, proxyWorkerResponse } from '../../lib/api';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const response = await apiRawFetch(`/api/buscar${url.search}`, {
      method: 'GET',
    });

    return proxyWorkerResponse(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao validar código.';
    return jsonError(message);
  }
};
