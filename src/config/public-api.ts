/*
 * Public browser endpoints.
 *
 * These URLs are not secrets: every endpoint called directly by frontend code
 * is visible in the browser Network tab. Use PUBLIC_* env vars to override them
 * per deploy. To hide endpoints for real, route requests through a backend proxy.
 */

const cleanUrl = (value: unknown): string => String(value || '').trim();

const fallbackApiUrls = {
  recruiter: 'https://script.google.com/macros/s/AKfycbx30E6Ty1JMZeBGRbAmqe6yHG7uRp1K_wXr198sSoURs_uNtwIa90NMSi-_k9H29dhd/exec',
  inscricao: 'https://script.google.com/macros/s/AKfycbz2v0Ssig7czjEOQDr1NbxOE4_vy0mGhzWjy2Lo7rocIm-wyB4p1OYChbB2PXwKNj9d/exec',
  search: 'https://script.google.com/macros/s/AKfycbwGdUL3p5qf1GozVaGkE0Xx9epH4Pf5pJe59eennDsD34hX0P85HekUl_9p4HqzBzLS/exec',
} as const;

export const publicApiUrls = {
  recruiter: cleanUrl(import.meta.env.PUBLIC_RECRUITER_API_URL) || fallbackApiUrls.recruiter,
  inscricao: cleanUrl(import.meta.env.PUBLIC_INSCRICAO_API_URL) || fallbackApiUrls.inscricao,
  search: cleanUrl(import.meta.env.PUBLIC_SEARCH_API_URL) || fallbackApiUrls.search,
} as const;
