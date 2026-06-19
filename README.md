# FP Agency Videos

Plataforma profissional para analisar e baixar videos publicos em MP4 ou MP3 usando Astro 5, Node.js, Express e yt-dlp.

## Arquitetura

```text
FP Agency/
├── package.json
├── package-lock.json
├── astro.config.mjs
├── tsconfig.json
├── .env.example
├── Dockerfile
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── robots.txt
│   └── sitemap.xml
├── server/
│   ├── index.js
│   └── package.json
└── src/
    ├── layouts/
    │   └── Layout.astro
    ├── components/
    │   ├── Footer.astro
    │   ├── Header.astro
    │   └── WhatsAppFab.astro
    └── pages/
        └── videos.astro
```

## Funcionalidades

- Campo para colar URL com deteccao automatica do servico.
- Suporte a YouTube, TikTok, Instagram Reels, Instagram Videos, Facebook Videos e Kwai.
- Analise com thumbnail, titulo, autor, duracao, resolucoes e tamanho estimado.
- Download temporario em MP4 360p, 480p, 720p e 1080p quando a qualidade existir no provedor.
- Download MP3 em 128kbps e 320kbps via ffmpeg.
- API Express com Helmet, CORS, rate limit, sanitizacao de URL e validacao de dominio.
- SEO com Open Graph, Twitter Cards, JSON-LD, `robots.txt` e `sitemap.xml`.
- Cache em memoria para analises e tokens temporarios de download.

## Requisitos

- Node.js 20.11.1 ou superior.
- npm.
- yt-dlp.
- ffmpeg.
- Linux Fedora, Ubuntu Server ou Docker.

## Instalacao no Fedora

```sh
sudo dnf install -y nodejs npm yt-dlp ffmpeg
npm install
cp .env.example .env
```

## Instalacao no Ubuntu Server

```sh
sudo apt update
sudo apt install -y curl ca-certificates ffmpeg yt-dlp
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
npm install
cp .env.example .env
```

## Execucao local

Instale as dependencias e suba Astro + API Express juntos:

```sh
npm install
npm run dev
```

A pagina fica em `http://localhost:4321/videos` e a API em `http://localhost:3001`.

Para testar o ambiente antes de iniciar:

```sh
npm run diagnose
```

Se quiser rodar os servicos separados, use `npm run dev:astro` e `npm run dev:api`.

## Variaveis de ambiente

As principais variaveis estao em `.env.example`.

- `PORT`: porta da API Express.
- `SITE_URL`: origem publica usada pelo Astro.
- `SITE_BASE_PATH`: base path do site. Use `/site-da-fp-agency` no GitHub Pages e `/` em VPS com dominio proprio.
- `PUBLIC_VIDEO_API_URL`: URL publica da API usada pelo frontend.
- `CORS_ORIGINS`: origens autorizadas a chamar a API.
- `YTDLP_PATH`: caminho do binario `yt-dlp`.
- `FFMPEG_PATH`: caminho do binario `ffmpeg`.
- `YTDLP_TIMEOUT_MS`: timeout de analise.
- `DOWNLOAD_TOKEN_TTL_MS`: validade dos links temporarios.

## API

### `POST /api/info`

Entrada:

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

Saida:

```json
{
  "success": true,
  "data": {
    "title": "Titulo do video",
    "author": "Autor",
    "durationLabel": "3:32",
    "platform": {
      "label": "YouTube"
    },
    "downloadOptions": {
      "video": [],
      "audio": []
    }
  }
}
```

### `POST /api/download`

Entrada para video:

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "type": "video",
  "quality": "720",
  "title": "Titulo do video"
}
```

Entrada para audio:

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "type": "audio",
  "quality": "128",
  "title": "Titulo do video"
}
```

Saida:

```json
{
  "success": true,
  "data": {
    "downloadUrl": "http://localhost:3001/api/download/token-temporario",
    "expiresAt": "2026-06-19T18:00:00.000Z",
    "filename": "titulo-do-video-720p.mp4"
  }
}
```

## Tratamento de erros

A API retorna `success: false` com codigos previsiveis:

- `INVALID_URL`: link invalido.
- `UNSUPPORTED_DOMAIN`: plataforma nao suportada.
- `VIDEO_PRIVATE`: video privado, restrito ou com login.
- `VIDEO_REMOVED`: video removido ou indisponivel.
- `FORMAT_UNAVAILABLE`: resolucao ou audio indisponivel.
- `RATE_LIMITED`: limite excedido.
- `YTDLP_NOT_FOUND`: `yt-dlp` nao instalado.
- `FFMPEG_NOT_FOUND`: `ffmpeg` nao instalado.
- `SERVER_ERROR`: falha inesperada.

## Build

```sh
npm run build
npm run server:check
```

Depois do build, `npm run start` serve a API e os arquivos estaticos de `dist/` no mesmo processo Express.

## Deploy em VPS Ubuntu

1. Copie o projeto para `/opt/fp-agency`.
2. Instale Node.js 22, yt-dlp e ffmpeg.
3. Configure `/opt/fp-agency/.env` a partir de `.env.example`.
4. Rode:

```sh
cd /opt/fp-agency
npm ci
SITE_URL=http://localhost:3001 SITE_BASE_PATH=/ PUBLIC_VIDEO_API_URL=http://localhost:3001 npm run build
NODE_ENV=production PORT=3001 npm run start
```

Unidade systemd recomendada:

```ini
[Unit]
Description=FP Agency Videos
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/fp-agency
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=SITE_URL=http://localhost:3001
Environment=SITE_BASE_PATH=/
Environment=PUBLIC_VIDEO_API_URL=http://localhost:3001
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

Ative:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now fp-agency-videos
```

## Deploy Docker

Build com base path raiz:

```sh
docker build \
  --build-arg SITE_URL=http://localhost:3001 \
  --build-arg SITE_BASE_PATH=/ \
  --build-arg PUBLIC_VIDEO_API_URL=http://localhost:3001 \
  -t fp-agency-videos .
```

Execucao:

```sh
docker run --env-file .env -p 3001:3001 fp-agency-videos
```

## Seguranca e uso responsavel

A plataforma valida dominios, nao executa comandos via shell, aplica rate limit e usa tokens temporarios. Mesmo assim, use apenas videos proprios, publicos ou com autorizacao do titular. O operador da VPS deve respeitar os termos de uso de cada plataforma e as leis locais de direitos autorais.
