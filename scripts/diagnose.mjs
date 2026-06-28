import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checks = [];

const packageJson = await readJson(path.join(rootDir, 'package.json'));

await checkNode();
await checkRequiredFiles();
await checkPackageScripts();
await checkDependencies();
await checkCommand(process.execPath, ['--check', path.join(rootDir, 'scripts/diagnose.mjs')], 'diagnose.mjs syntax');
await checkCommand(getNpmCommand(), ['run', 'build'], 'Astro build');
await checkPort(4321, '/');

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

async function checkRequiredFiles() {
  const requiredFiles = [
    'package.json',
    'package-lock.json',
    'astro.config.mjs',
    'tsconfig.json',
    'src/layouts/Layout.astro',
    'src/pages/index.astro',
    'src/pages/inscricao.astro',
    'src/pages/recrutador.astro',
    'src/pages/treinamento/index.astro',
    'public/robots.txt',
    'public/sitemap.xml',
  ];

  for (const file of requiredFiles) {
    const exists = await fileExists(path.join(rootDir, file));
    add(exists ? 'OK' : 'FAIL', `Arquivo ${file}`, exists ? 'encontrado' : 'ausente');
  }
}

async function checkPackageScripts() {
  const requiredScripts = ['dev', 'dev:astro', 'build', 'check', 'preview', 'diagnose'];
  const scripts = packageJson?.scripts ?? {};

  for (const scriptName of requiredScripts) {
    add(
      scripts[scriptName] ? 'OK' : 'FAIL',
      `Script npm ${scriptName}`,
      scripts[scriptName] || 'ausente',
    );
  }
}

async function checkDependencies() {
  const dependencies = {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {}),
  };

  for (const dependency of Object.keys(dependencies).sort()) {
    try {
      const packagePath = path.join(rootDir, 'node_modules', dependency, 'package.json');
      const installedPackage = JSON.parse(await fs.readFile(packagePath, 'utf8'));
      add('OK', `Dependencia ${dependency}`, installedPackage.version);
    } catch {
      add('FAIL', `Dependencia ${dependency}`, 'nao instalada; execute npm install');
    }
  }
}

async function checkCommand(command, args, name) {
  const result = await run(command, args);
  const output = `${result.stdout || result.stderr}`.split('\n').find(Boolean) || 'sem saida';
  add(result.code === 0 ? 'OK' : 'FAIL', name, output.trim());
}

async function checkPort(port, requestPath) {
  const open = await isPortOpen(port);

  if (!open) {
    add('OK', `Porta ${port}`, 'livre');
    return;
  }

  const statusCode = await requestStatus(port, requestPath);
  if (statusCode && statusCode < 500) {
    add('OK', `Porta ${port}`, `servidor respondendo com HTTP ${statusCode}`);
    return;
  }

  add('WARN', `Porta ${port}`, 'em uso, mas sem resposta HTTP valida');
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

function requestStatus(port, requestPath) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        host: '127.0.0.1',
        port,
        path: requestPath,
        timeout: 1200,
      },
      (res) => {
        res.resume();
        res.on('end', () => resolve(res.statusCode ?? null));
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

async function readJson(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    return null;
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

function getNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}
