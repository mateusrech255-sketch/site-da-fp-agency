import { spawn } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checks = [];

await checkNode();
await checkFiles();
await checkDependencies();
await checkCommand('yt-dlp', ['--version'], 'yt-dlp');
await checkCommand('ffmpeg', ['-version'], 'ffmpeg');
await checkPort(3001, '/health');
await checkPort(4321, '/');
await checkCommand(process.execPath, ['--check', path.join(rootDir, 'server/index.js')], 'server/index.js syntax');

const failed = checks.filter((check) => check.status === 'FAIL');
const warned = checks.filter((check) => check.status === 'WARN');

console.log('\n[diagnose] Relatorio');
for (const check of checks) {
  console.log(`[${check.status}] ${check.name}: ${check.detail}`);
}

if (failed.length > 0) {
  console.error(`\n[diagnose] ${failed.length} erro(s) critico(s) encontrados.`);
  process.exit(1);
}

if (warned.length > 0) {
  console.log(`\n[diagnose] ${warned.length} aviso(s). O projeto pode iniciar, mas revise os detalhes acima.`);
  process.exit(0);
}

console.log('\n[diagnose] Ambiente pronto.');

async function checkNode() {
  const current = process.versions.node;
  const ok = compareVersions(current, '20.11.1') >= 0;
  add(ok ? 'OK' : 'FAIL', 'Node.js', `${current}${ok ? '' : ' precisa ser >= 20.11.1'}`);
}

async function checkFiles() {
  const requiredFiles = [
    'package.json',
    'astro.config.mjs',
    'tsconfig.json',
    'server/index.js',
    'server/package.json',
    'src/pages/videos.astro',
    '.env.example',
  ];

  for (const file of requiredFiles) {
    const exists = await fileExists(path.join(rootDir, file));
    add(exists ? 'OK' : 'FAIL', `Arquivo ${file}`, exists ? 'encontrado' : 'ausente');
  }

  const envExists = await fileExists(path.join(rootDir, '.env'));
  add(envExists ? 'OK' : 'WARN', 'Arquivo .env', envExists ? 'encontrado' : 'ausente; usando defaults do codigo');
}

async function checkDependencies() {
  const dependencies = ['astro', 'express', 'cors', 'helmet', 'express-rate-limit', 'compression', 'dotenv', 'concurrently'];

  for (const dependency of dependencies) {
    try {
      const packagePath = path.join(rootDir, 'node_modules', dependency, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
      add('OK', `Dependencia ${dependency}`, packageJson.version);
    } catch {
      add('FAIL', `Dependencia ${dependency}`, 'nao instalada; execute npm install');
    }
  }
}

async function checkCommand(command, args, name) {
  const result = await run(command, args);
  const firstLine = `${result.stdout || result.stderr}`.split('\n').find(Boolean) || 'sem saida';
  add(result.code === 0 ? 'OK' : 'FAIL', name, result.code === 0 ? firstLine.trim() : firstLine.trim());
}

async function checkPort(port, healthPath) {
  const open = await isPortOpen(port);

  if (!open) {
    add('OK', `Porta ${port}`, 'livre');
    return;
  }

  const health = await requestJson(port, healthPath);

  if (port === 3001 && health?.status === 'online') {
    add('OK', `Porta ${port}`, 'API online');
    return;
  }

  if (port === 4321) {
    add('OK', `Porta ${port}`, 'Astro ou outro servidor respondendo');
    return;
  }

  add('WARN', `Porta ${port}`, 'em uso por outro processo ou resposta inesperada');
}

function add(status, name, detail) {
  checks.push({ status, name, detail });
}

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');
    child.stdout?.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (error) => resolve({ code: 127, stdout, stderr: error.message }));
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port, timeout: 800 });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });
}

function requestJson(port, requestPath) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        host: '127.0.0.1',
        port,
        path: requestPath,
        timeout: 1200,
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch {
            resolve(null);
          }
        });
      },
    );

    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.on('error', () => resolve(null));
  });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function compareVersions(left, right) {
  const leftParts = left.split('.').map(Number);
  const rightParts = right.split('.').map(Number);
  const max = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < max; index += 1) {
    const leftValue = leftParts[index] || 0;
    const rightValue = rightParts[index] || 0;
    if (leftValue > rightValue) return 1;
    if (leftValue < rightValue) return -1;
  }

  return 0;
}
