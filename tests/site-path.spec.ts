import { expect, test } from 'vitest';
import { normalizeBasePath, withBasePath } from '../src/lib/site-path';

test('withBasePath builds root-relative links without protocol-relative URLs', () => {
  expect(withBasePath('/inscricao?programa=kwai-narrastars', '/')).toBe(
    '/inscricao?programa=kwai-narrastars',
  );
  expect(withBasePath('treinamento/aula-1', '/')).toBe('/treinamento/aula-1');
});

test('withBasePath preserves deploy subpaths without duplicate slashes', () => {
  expect(withBasePath('/inscricao?programa=kwai-cut', '/fp-agency/')).toBe(
    '/fp-agency/inscricao?programa=kwai-cut',
  );
});

test('normalizeBasePath tolerates accidental absolute site values', () => {
  expect(normalizeBasePath('https://fpagency.com.br')).toBe('');
  expect(normalizeBasePath('https://fpagency.com.br/app/')).toBe('/app');
});
