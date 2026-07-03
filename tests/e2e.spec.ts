import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';

const BASE_PORT = 4397;
const PAGES = [
  '/',
  '/recrutador',
  '/dashboard',
  '/inscricao',
  '/busca',
  '/relatorios',
  '/resultado',
];

let server: ChildProcess | null = null;
let output = '';
let port = BASE_PORT;
let serverStarted = false;

function getOrigin(): string {
  return `http://127.0.0.1:${port}`;
}

function isPortAvailable(candidate: number): Promise<boolean> {
  return new Promise((resolvePort) => {
    const tester = createServer();
    tester.once('error', () => resolvePort(false));
    tester.once('listening', () => {
      tester.close(() => resolvePort(true));
    });
    tester.listen(candidate, '127.0.0.1');
  });
}

async function getAvailablePort(start: number): Promise<number> {
  for (let candidate = start; candidate < start + 100; candidate += 1) {
    if (await isPortAvailable(candidate)) return candidate;
  }

  throw new Error(`Nenhuma porta livre encontrada entre ${start} e ${start + 99}.`);
}

function loadDotEnv(): Record<string, string> {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return {};

  return readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .reduce<Record<string, string>>((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return acc;

      const separator = trimmed.indexOf('=');
      if (separator === -1) return acc;

      const key = trimmed.slice(0, separator).trim();
      const rawValue = trimmed.slice(separator + 1).trim();
      if (!key) return acc;

      acc[key] = rawValue.replace(/^(['"])(.*)\1$/, '$2');
      return acc;
    }, {});
}

function stopManagedDevServer(env: Record<string, string | undefined>): void {
  spawnSync('./node_modules/.bin/astro', ['dev', 'stop'], {
    cwd: process.cwd(),
    env,
    stdio: 'ignore',
  });
}

function waitForServerExit(timeoutMs = 3_000): Promise<boolean> {
  return new Promise((resolveExit) => {
    if (!server || server.exitCode !== null) {
      resolveExit(true);
      return;
    }

    const timeout = setTimeout(() => resolveExit(false), timeoutMs);
    server.once('exit', () => {
      clearTimeout(timeout);
      resolveExit(true);
    });
  });
}

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${getOrigin()}/`);
      if (response.ok) return;
    } catch {
      const isManagedServer = /Dev server (?:already )?running/.test(output);
      if (server?.exitCode !== null && !isManagedServer) {
        throw new Error(`astro dev encerrou antes da validação:\n${output}`);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`astro dev não respondeu dentro do tempo esperado:\n${output}`);
}

beforeAll(async () => {
  const localEnv = loadDotEnv();
  const childEnv = { ...process.env, ...localEnv, NODE_ENV: 'development' };
  stopManagedDevServer(childEnv);
  port = await getAvailablePort(BASE_PORT);
  const child = spawn(
    './node_modules/.bin/astro',
    ['dev', '--host', '127.0.0.1', '--port', String(port)],
    {
      cwd: process.cwd(),
      env: childEnv,
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
  serverStarted = true;
}, 35_000);

afterAll(async () => {
  if (serverStarted) {
    const localEnv = loadDotEnv();
    const childEnv = { ...process.env, ...localEnv, NODE_ENV: 'development' };
    stopManagedDevServer(childEnv);
    await waitForServerExit();
    stopManagedDevServer(childEnv);
  }

  if (server && server.exitCode === null) {
    server.kill('SIGKILL');
    await waitForServerExit(1_000);
  }
});

describe('astro app e2e', () => {
  test.each(PAGES)('renders %s', async (path) => {
    const response = await fetch(`${getOrigin()}${path}`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('<html');
  });

  test('proxy validates recruiter code through Worker', async () => {
    const response = await fetch(`${getOrigin()}/api/buscar?codigo=66333`);
    const body = (await response.json()) as { ok: boolean; found: boolean };

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, found: true });
  });

  test('search proxy queries approval data through Worker', async () => {
    const response = await fetch(`${getOrigin()}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'buscarAprovacao',
        data: { termo: 'Mateus', filtro: 'all', page: 1, limit: 4 },
      }),
    });
    const body = (await response.json()) as { success: boolean; data?: unknown[] };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('relatorios proxy queries monthly reports through Worker', async () => {
    const response = await fetch(`${getOrigin()}/api/relatorios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ termo: 'Mateus', filtro: 'all', page: 1, limit: 4 }),
    });
    const body = (await response.json()) as { success: boolean; data?: unknown[] };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});
