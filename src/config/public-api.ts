const cleanUrl = (value: unknown): string => String(value || '').trim();

export const workerApiBase =
  cleanUrl(import.meta.env.PUBLIC_API_BASE) || 'https://api.fpagency.com.br';

export const publicApiUrls = {
  buscar: '/api/buscar',
  inscricao: '/api/inscricao',
  relatorios: '/api/relatorios',
  recruiter: '/api/worker',
  search: '/api/search',
} as const;
