import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';

const PORT = 4397;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const PAGES = ['/', '/recrutador', '/inscricao', '/busca'];

let server: ChildProcess | null = null;
let output = '';

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    if (server?.exitCode !== null) {
      throw new Error(`astro dev encerrou antes da validação:\n${output}`);
    }

    try {
      const response = await fetch(`${ORIGIN}/`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw new Error(`astro dev não respondeu dentro do tempo esperado:\n${output}`);
}

beforeAll(async () => {
  const child = spawn(
    './node_modules/.bin/astro',
    ['dev', '--host', '127.0.0.1', '--port', String(PORT)],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'development',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  server = child;

  child.stdout?.on('data', (chunk) => {
    output += String(chunk);
  });
  child.stderr?.on('data', (chunk) => {
    output += String(chunk);
  });

  await waitForServer();
}, 35_000);

afterAll(() => {
  if (server && server.exitCode === null) {
    server.kill('SIGTERM');
  }
});

describe('astro app e2e', () => {
  test.each(PAGES)('renders %s', async (path) => {
    const response = await fetch(`${ORIGIN}${path}`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('<html');
  });

  test('proxy validates recruiter code through Worker', async () => {
    const response = await fetch(`${ORIGIN}/api/buscar?codigo=66333`);
    const body = (await response.json()) as { ok: boolean; found: boolean };

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, found: true });
  });
});
