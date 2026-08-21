export function normalizeBasePath(base: string | undefined): string {
  const value = String(base || '').trim();

  if (!value || value === '/') return '';

  if (/^https?:\/\//i.test(value)) {
    try {
      const pathname = new URL(value).pathname;
      return pathname === '/' ? '' : pathname.replace(/\/+$/, '');
    } catch {
      return '';
    }
  }

  const path = value.startsWith('/') ? value : `/${value}`;
  return path === '/' ? '' : path.replace(/\/+$/, '');
}

export function withBasePath(path: string, base: string | undefined): string {
  const basePath = normalizeBasePath(base);
  const internalPath = path.startsWith('/') ? path : `/${path}`;

  return `${basePath}${internalPath}`;
}
