import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

dotenv.config({ path: path.join(rootDir, '.env'), quiet: true });

const app = express();
const siteBasePath = normalizeBasePath(process.env.SITE_BASE_PATH ?? '/site-da-fp-agency');

const config = {
  port: toPositiveInt(process.env.PORT, 3001),
  trustProxy: toPositiveInt(process.env.TRUST_PROXY, 1),
  ytDlpPath: process.env.YTDLP_PATH || 'yt-dlp',
  ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
  ytDlpTimeoutMs: toPositiveInt(process.env.YTDLP_TIMEOUT_MS, 45_000),
  cacheTtlMs: toPositiveInt(process.env.INFO_CACHE_TTL_MS, 300_000),
  tokenTtlMs: toPositiveInt(process.env.DOWNLOAD_TOKEN_TTL_MS, 600_000),
  rateWindowMs: toPositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 900_000),
  rateMax: toPositiveInt(process.env.RATE_LIMIT_MAX, 120),
  infoRateMax: toPositiveInt(process.env.INFO_RATE_LIMIT_MAX, 30),
  downloadRateMax: toPositiveInt(process.env.DOWNLOAD_RATE_LIMIT_MAX, 12),
  maxRequestBodySize: process.env.MAX_REQUEST_BODY_SIZE || '12kb',
};

const supportedPlatforms = [
  {
    id: 'youtube',
    label: 'YouTube',
    domains: ['youtube.com', 'youtu.be', 'youtube-nocookie.com', 'music.youtube.com'],
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    domains: ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'],
  },
  {
    id: 'instagram',
    label: 'Instagram',
    domains: ['instagram.com'],
  },
  {
    id: 'facebook',
    label: 'Facebook Videos',
    domains: ['facebook.com', 'fb.watch', 'fb.com'],
  },
  {
    id: 'kwai',
    label: 'Kwai',
    domains: ['kwai.com', 'kwai.app', 'kw.ai'],
  },
];

const videoQualityRanges = {
  360: { min: 300, max: 400 },
  480: { min: 401, max: 540 },
  720: { min: 541, max: 800 },
  1080: { min: 801, max: 1200 },
};

const allowedVideoQualities = new Set(Object.keys(videoQualityRanges));
const allowedAudioBitrates = new Set(['128', '320']);
const infoCache = new Map();
const downloadTokens = new Map();

app.set('trust proxy', config.trustProxy);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'base-uri': ["'self'"],
        'frame-ancestors': ["'none'"],
        'img-src': ["'self'", 'data:', 'blob:', 'https:', 'http:'],
        'media-src': ["'self'", 'blob:', 'https:', 'http:'],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'connect-src': ["'self'", 'http://localhost:3001', 'http://127.0.0.1:3001', 'https:'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
);
app.use(compression());
app.use(cors({ origin: resolveCorsOrigin, credentials: false }));
app.use(express.json({ limit: config.maxRequestBodySize, strict: true }));
app.use((req, _res, next) => {
  console.log('[API] Requisição recebida', req.method, req.originalUrl);
  next();
});

const apiLimiter = createLimiter(config.rateMax, config.rateWindowMs, 'RATE_LIMITED');
const infoLimiter = createLimiter(config.infoRateMax, config.rateWindowMs, 'INFO_RATE_LIMITED');
const downloadLimiter = createLimiter(config.downloadRateMax, config.rateWindowMs, 'DOWNLOAD_RATE_LIMITED');

app.use('/api', apiLimiter);

app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    service: 'fp-agency-video-api',
    api: {
      health: '/health',
      info: '/api/info',
      download: '/api/download',
    },
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'online' });
});

app.get('/api/health', (_req, res) => {
  res.json(buildHealthPayload());
});

function buildHealthPayload() {
  return {
    success: true,
    service: 'fp-agency-video-api',
    status: 'online',
    supportedPlatforms: supportedPlatforms.map((platform) => platform.label),
    timestamp: new Date().toISOString(),
  };
}

app.post('/api/info', infoLimiter, async (req, res) => {
  try {
    const target = validateVideoUrl(req.body?.url);
    const cached = readInfoCache(target.normalizedUrl);

    if (cached) {
      res.setHeader('Cache-Control', 'private, max-age=60');
      return res.json({ success: true, data: cached, cached: true });
    }

    const stdout = await runYtDlp([
      '--dump-single-json',
      '--skip-download',
      '--no-playlist',
      '--no-warnings',
      '--socket-timeout',
      '20',
      target.normalizedUrl,
    ]);

    const rawInfo = parseYtDlpJson(stdout);
    const videoInfo = normalizeVideoInfo(rawInfo, target);

    writeInfoCache(target.normalizedUrl, videoInfo);
    res.setHeader('Cache-Control', 'private, max-age=60');
    return res.json({ success: true, data: videoInfo, cached: false });
  } catch (error) {
    return sendError(res, error);
  }
});

app.post('/api/download', downloadLimiter, async (req, res) => {
  try {
    const target = validateVideoUrl(req.body?.url);
    const type = String(req.body?.type || '').toLowerCase();
    const quality = String(req.body?.quality || '').toLowerCase().replace(/[^0-9]/g, '');

    if (!['video', 'audio'].includes(type)) {
      throw createHttpError(400, 'INVALID_DOWNLOAD_TYPE', 'Escolha uma opcao de download de video ou audio.');
    }

    if (type === 'video' && !allowedVideoQualities.has(quality)) {
      throw createHttpError(400, 'INVALID_QUALITY', 'Escolha uma resolucao de video valida.');
    }

    if (type === 'audio' && !allowedAudioBitrates.has(quality)) {
      throw createHttpError(400, 'INVALID_QUALITY', 'Escolha uma qualidade de audio valida.');
    }

    const token = createDownloadToken({
      url: target.normalizedUrl,
      type,
      quality,
      platform: target.platform.id,
      title: sanitizeFilename(String(req.body?.title || 'fp-agency-video')),
    });

    const expiresAt = new Date(Date.now() + config.tokenTtlMs).toISOString();

    return res.json({
      success: true,
      data: {
        downloadUrl: `${getRequestOrigin(req)}/api/download/${token}`,
        expiresAt,
        filename: buildFilename(req.body?.title, type, quality),
        type,
        quality: type === 'video' ? `${quality}p` : `MP3 ${quality}kbps`,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
});

app.get('/api/download/:token', downloadLimiter, async (req, res) => {
  try {
    const payload = readDownloadToken(req.params.token);

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Accel-Buffering', 'no');

    if (payload.type === 'video') {
      return streamVideoDownload(payload, req, res);
    }

    return streamAudioDownload(payload, req, res);
  } catch (error) {
    return sendError(res, error);
  }
});

if (fs.existsSync(distDir)) {
  const staticMiddleware = express.static(distDir, {
      etag: true,
      index: false,
      setHeaders(res, filePath) {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
          return;
        }

        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      },
    });

  app.use(staticMiddleware);

  if (siteBasePath !== '/') {
    app.use(siteBasePath, staticMiddleware);
  }

  app.get(/.*/, (req, res, next) => {
    const requestPath = stripBasePath(req.path);
    const cleanPath = requestPath.replace(/\/$/, '') || '/';
    const fileCandidates = [
      path.join(distDir, cleanPath, 'index.html'),
      path.join(distDir, `${cleanPath}.html`),
      path.join(distDir, 'index.html'),
    ];
    const page = fileCandidates.find((candidate) => candidate.startsWith(distDir) && fs.existsSync(candidate));

    if (!page) {
      return next();
    }

    res.setHeader('Cache-Control', 'no-cache');
    return res.sendFile(page);
  });
}

app.use((_req, res) => {
  sendError(res, createHttpError(404, 'NOT_FOUND', 'Rota nao encontrada.'));
});

app.use((error, _req, res, _next) => {
  sendError(res, error);
});

const server = app.listen(config.port, () => {
  console.log('[API] Servidor iniciado');
  console.log(`[API] URL: http://localhost:${config.port}`);
});

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

setInterval(cleanupStores, 60_000).unref();

function shutdown() {
  server.close(() => process.exit(0));
}

function toPositiveInt(value, fallback) {
  const number = Number.parseInt(value ?? '', 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function normalizeBasePath(value) {
  const trimmed = String(value || '/').trim();
  if (!trimmed || trimmed === '/') return '/';
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}`;
}

function stripBasePath(requestPath) {
  if (siteBasePath === '/') return requestPath;
  if (requestPath === siteBasePath) return '/';
  if (requestPath.startsWith(`${siteBasePath}/`)) {
    return requestPath.slice(siteBasePath.length) || '/';
  }
  return requestPath;
}

function createLimiter(limit, windowMs, code) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code,
        message: 'Limite de requisicoes excedido. Aguarde alguns minutos e tente novamente.',
      },
    },
  });
}

function resolveCorsOrigin(origin, callback) {
  const rawOrigins =
    process.env.CORS_ORIGINS ||
    process.env.CORS_ORIGIN ||
    'http://localhost:4321,http://127.0.0.1:4321,http://localhost:3001,http://127.0.0.1:3001';
  const allowedOrigins = rawOrigins
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(createHttpError(403, 'CORS_BLOCKED', 'Origem nao autorizada pelo CORS.'));
}

function validateVideoUrl(input) {
  if (typeof input !== 'string') {
    throw createHttpError(400, 'INVALID_URL', 'Cole um link valido para analisar o video.');
  }

  const trimmed = input.trim();

  if (!trimmed || trimmed.length > 2048 || /[\u0000-\u001f]/.test(trimmed)) {
    throw createHttpError(400, 'INVALID_URL', 'Cole um link valido para analisar o video.');
  }

  let parsed;

  try {
    parsed = new URL(trimmed);
  } catch {
    throw createHttpError(400, 'INVALID_URL', 'O link informado nao e uma URL valida.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw createHttpError(400, 'INVALID_URL', 'Use apenas links HTTP ou HTTPS sem credenciais.');
  }

  parsed.hash = '';
  const platform = detectPlatform(parsed);

  if (!platform) {
    throw createHttpError(
      400,
      'UNSUPPORTED_DOMAIN',
      'Dominio nao suportado. Use links do YouTube, TikTok, Instagram, Facebook ou Kwai.',
    );
  }

  return {
    normalizedUrl: parsed.toString(),
    hostname: parsed.hostname.toLowerCase(),
    platform,
    serviceLabel: resolveServiceLabel(platform, parsed),
  };
}

function detectPlatform(parsedUrl) {
  const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');

  return supportedPlatforms.find((platform) =>
    platform.domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`)),
  );
}

function resolveServiceLabel(platform, parsedUrl) {
  const pathname = parsedUrl.pathname.toLowerCase();

  if (platform.id === 'instagram') {
    return pathname.includes('/reel/') ? 'Instagram Reels' : 'Instagram Videos';
  }

  if (platform.id === 'facebook') {
    return 'Facebook Videos';
  }

  return platform.label;
}

function runYtDlp(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(config.ytDlpPath, args, {
      cwd: rootDir,
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
      },
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const timeout = setTimeout(() => {
      settled = true;
      child.kill('SIGTERM');
      reject(createHttpError(504, 'YTDLP_TIMEOUT', 'A analise demorou demais. Tente novamente em instantes.'));
    }, options.timeoutMs || config.ytDlpTimeoutMs);

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
      if (stdout.length > 25_000_000) {
        settled = true;
        child.kill('SIGTERM');
        reject(createHttpError(502, 'YTDLP_OUTPUT_TOO_LARGE', 'A resposta do provedor excedeu o limite seguro.'));
      }
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      if (settled) return;
      settled = true;

      if (error.code === 'ENOENT') {
        reject(createHttpError(500, 'YTDLP_NOT_FOUND', 'yt-dlp nao encontrado no servidor.'));
        return;
      }

      reject(createHttpError(500, 'SERVER_ERROR', 'Falha ao iniciar o yt-dlp.'));
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (settled) return;
      settled = true;

      if (code === 0) {
        resolve(stdout.trim());
        return;
      }

      reject(classifyYtDlpError(stderr || stdout));
    });
  });
}

function parseYtDlpJson(stdout) {
  try {
    return JSON.parse(stdout);
  } catch {
    throw createHttpError(502, 'INVALID_PROVIDER_RESPONSE', 'O provedor retornou dados em formato inesperado.');
  }
}

function normalizeVideoInfo(info, target) {
  const duration = Number(info.duration || 0);
  const title = String(info.title || 'Video sem titulo').trim();
  const author = String(info.uploader || info.channel || info.creator || info.artist || 'Autor nao informado').trim();
  const thumbnail = selectThumbnail(info);
  const formats = Array.isArray(info.formats) ? info.formats : [];
  const progressiveFormats = formats.filter(isProgressiveVideoFormat);
  const audioFormats = formats.filter(isAudioFormat);

  return {
    id: String(info.id || crypto.createHash('sha1').update(target.normalizedUrl).digest('hex').slice(0, 16)),
    url: target.normalizedUrl,
    title,
    author,
    duration,
    durationLabel: formatDuration(duration),
    thumbnail,
    platform: {
      id: target.platform.id,
      label: target.serviceLabel,
      hostname: target.hostname,
    },
    downloadOptions: {
      video: buildVideoOptions(progressiveFormats, duration),
      audio: buildAudioOptions(audioFormats, duration),
    },
    analyzedAt: new Date().toISOString(),
  };
}

function selectThumbnail(info) {
  const thumbnails = Array.isArray(info.thumbnails) ? info.thumbnails : [];
  const bestThumbnail = thumbnails
    .filter((thumbnail) => thumbnail?.url)
    .sort((a, b) => Number(b.width || 0) - Number(a.width || 0))[0];

  return bestThumbnail?.url || info.thumbnail || '';
}

function isProgressiveVideoFormat(format) {
  return (
    format &&
    format.vcodec &&
    format.vcodec !== 'none' &&
    format.acodec &&
    format.acodec !== 'none' &&
    Number(format.height) > 0
  );
}

function isAudioFormat(format) {
  return format && format.acodec && format.acodec !== 'none';
}

function buildVideoOptions(formats, duration) {
  return Object.entries(videoQualityRanges).map(([quality, range]) => {
    const candidate = formats
      .filter((format) => Number(format.height) >= range.min && Number(format.height) <= range.max)
      .sort((a, b) => Number(b.height || 0) - Number(a.height || 0) || Number(b.tbr || 0) - Number(a.tbr || 0))[0];

    return {
      type: 'video',
      quality: `${quality}p`,
      value: quality,
      available: Boolean(candidate),
      resolution: candidate ? `${candidate.width || 'auto'}x${candidate.height}` : `${quality}p`,
      extension: candidate?.ext || 'mp4',
      estimatedSize: estimateVideoSize(candidate, duration),
      estimatedSizeLabel: formatBytes(estimateVideoSize(candidate, duration)),
    };
  });
}

function buildAudioOptions(formats, duration) {
  const available = formats.length > 0;

  return [128, 320].map((bitrate) => {
    const estimatedSize = duration > 0 ? (bitrate * 1000 * duration) / 8 : null;

    return {
      type: 'audio',
      quality: `MP3 ${bitrate}kbps`,
      value: String(bitrate),
      available,
      resolution: 'Audio MP3',
      extension: 'mp3',
      estimatedSize,
      estimatedSizeLabel: formatBytes(estimatedSize),
    };
  });
}

function estimateVideoSize(format, duration) {
  if (!format) return null;
  if (Number(format.filesize) > 0) return Number(format.filesize);
  if (Number(format.filesize_approx) > 0) return Number(format.filesize_approx);
  if (Number(format.tbr) > 0 && duration > 0) {
    return (Number(format.tbr) * 1000 * duration) / 8;
  }
  return null;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'Duracao indisponivel';

  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return 'Indisponivel';

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

function readInfoCache(key) {
  const item = infoCache.get(key);

  if (!item) return null;
  if (item.expiresAt <= Date.now()) {
    infoCache.delete(key);
    return null;
  }

  return item.data;
}

function writeInfoCache(key, data) {
  infoCache.set(key, {
    data,
    expiresAt: Date.now() + config.cacheTtlMs,
  });
}

function createDownloadToken(payload) {
  const token = crypto.randomBytes(32).toString('base64url');
  downloadTokens.set(token, {
    ...payload,
    expiresAt: Date.now() + config.tokenTtlMs,
  });
  return token;
}

function readDownloadToken(token) {
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(String(token || ''))) {
    throw createHttpError(400, 'INVALID_TOKEN', 'Link temporario invalido.');
  }

  const payload = downloadTokens.get(token);

  if (!payload) {
    throw createHttpError(404, 'TOKEN_NOT_FOUND', 'Link temporario nao encontrado ou ja expirado.');
  }

  if (payload.expiresAt <= Date.now()) {
    downloadTokens.delete(token);
    throw createHttpError(410, 'TOKEN_EXPIRED', 'Link temporario expirado. Analise o video novamente.');
  }

  return payload;
}

function streamVideoDownload(payload, req, res) {
  const selector = buildVideoSelector(payload.quality);
  const filename = buildFilename(payload.title, 'video', payload.quality);

  res.status(200);
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Disposition', contentDisposition(filename));

  return streamProcessToResponse(
    config.ytDlpPath,
    [
      '--no-playlist',
      '--no-warnings',
      '--quiet',
      '--format',
      selector,
      '--output',
      '-',
      payload.url,
    ],
    req,
    res,
    'YTDLP_NOT_FOUND',
  );
}

async function streamAudioDownload(payload, req, res) {
  const directAudioUrl = await runYtDlp([
    '--get-url',
    '--no-playlist',
    '--no-warnings',
    '--format',
    'bestaudio[acodec!=none]/bestaudio',
    '--socket-timeout',
    '20',
    payload.url,
  ]);

  const audioUrl = directAudioUrl.split('\n').find(Boolean);

  if (!audioUrl) {
    throw createHttpError(422, 'FORMAT_UNAVAILABLE', 'Nao foi possivel gerar o audio para este video.');
  }

  const filename = buildFilename(payload.title, 'audio', payload.quality);

  res.status(200);
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', contentDisposition(filename));

  return streamProcessToResponse(
    config.ffmpegPath,
    [
      '-nostdin',
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      audioUrl,
      '-vn',
      '-b:a',
      `${payload.quality}k`,
      '-f',
      'mp3',
      'pipe:1',
    ],
    req,
    res,
    'FFMPEG_NOT_FOUND',
  );
}

function buildVideoSelector(quality) {
  const range = videoQualityRanges[quality];
  return `best[height>=${range.min}][height<=${range.max}][vcodec!=none][acodec!=none][ext=mp4]/best[height>=${range.min}][height<=${range.max}][vcodec!=none][acodec!=none]`;
}

function streamProcessToResponse(command, args, req, res, missingCode) {
  const child = spawn(command, args, {
    cwd: rootDir,
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
    },
    shell: false,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderr = '';
  let closedByClient = false;

  const timeout = setTimeout(() => {
    child.kill('SIGTERM');
    if (!res.headersSent) {
      sendError(res, createHttpError(504, 'DOWNLOAD_TIMEOUT', 'O download demorou demais e foi encerrado.'));
    } else {
      res.destroy();
    }
  }, config.ytDlpTimeoutMs * 4);

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  child.on('error', (error) => {
    clearTimeout(timeout);

    if (error.code === 'ENOENT') {
      const message =
        missingCode === 'FFMPEG_NOT_FOUND' ? 'ffmpeg nao encontrado no servidor.' : 'yt-dlp nao encontrado no servidor.';
      sendError(res, createHttpError(500, missingCode, message));
      return;
    }

    sendError(res, createHttpError(500, 'SERVER_ERROR', 'Falha ao iniciar o processo de download.'));
  });

  child.on('close', (code) => {
    clearTimeout(timeout);

    if (closedByClient || code === 0) return;

    if (!res.headersSent) {
      sendError(res, classifyYtDlpError(stderr));
      return;
    }

    res.destroy();
  });

  req.on('close', () => {
    closedByClient = true;
    child.kill('SIGTERM');
  });

  child.stdout.pipe(res);
}

function classifyYtDlpError(rawMessage) {
  const message = String(rawMessage || '').trim();
  const normalized = message.toLowerCase();

  if (normalized.includes('private') || normalized.includes('login') || normalized.includes('sign in')) {
    return createHttpError(403, 'VIDEO_PRIVATE', 'Este video e privado, restrito ou exige login.');
  }

  if (
    normalized.includes('unavailable') ||
    normalized.includes('removed') ||
    normalized.includes('deleted') ||
    normalized.includes('not available')
  ) {
    return createHttpError(404, 'VIDEO_REMOVED', 'Este video foi removido ou esta indisponivel.');
  }

  if (normalized.includes('unsupported url') || normalized.includes('invalid url')) {
    return createHttpError(400, 'INVALID_URL', 'O link informado nao pode ser analisado.');
  }

  if (normalized.includes('requested format is not available') || normalized.includes('no video formats found')) {
    return createHttpError(422, 'FORMAT_UNAVAILABLE', 'A qualidade escolhida nao esta disponivel para este video.');
  }

  if (normalized.includes('too many requests') || normalized.includes('rate limit')) {
    return createHttpError(429, 'PROVIDER_RATE_LIMIT', 'A plataforma limitou novas tentativas. Aguarde e tente novamente.');
  }

  return createHttpError(502, 'PROVIDER_ERROR', 'Nao foi possivel processar este link agora.');
}

function createHttpError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.publicMessage = message;
  return error;
}

function sendError(res, error) {
  if (res.headersSent) {
    res.destroy();
    return;
  }

  console.error('[API] Erro:', error);

  const status = Number(error?.status || error?.statusCode || 500);
  const code = error?.code || 'SERVER_ERROR';
  const message = error?.publicMessage || 'Falha do servidor. Tente novamente em instantes.';

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

function getRequestOrigin(req) {
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  const host = req.get('host');
  return `${protocol}://${host}`;
}

function sanitizeFilename(value) {
  const cleaned = String(value || 'fp-agency-video')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return cleaned || 'fp-agency-video';
}

function buildFilename(title, type, quality) {
  const baseName = sanitizeFilename(title);
  const suffix = type === 'video' ? `${quality}p` : `mp3-${quality}kbps`;
  const extension = type === 'video' ? 'mp4' : 'mp3';
  return `${baseName}-${suffix}.${extension}`;
}

function contentDisposition(filename) {
  const safeFilename = sanitizeFilename(filename.replace(/\.(mp4|mp3)$/i, ''));
  const extension = filename.toLowerCase().endsWith('.mp3') ? 'mp3' : 'mp4';
  return `attachment; filename="${safeFilename}.${extension}"`;
}

function cleanupStores() {
  const now = Date.now();

  for (const [key, value] of infoCache.entries()) {
    if (value.expiresAt <= now) infoCache.delete(key);
  }

  for (const [key, value] of downloadTokens.entries()) {
    if (value.expiresAt <= now) downloadTokens.delete(key);
  }
}
