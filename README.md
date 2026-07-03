# FP Agency

Site institucional e portal da FP Agency construidos com Astro. O projeto atual roda em SSR com `@astrojs/node` para manter o segredo interno no servidor e encaminhar chamadas para a API Cloudflare Worker.

## Estrutura

```text
FP Agency/
├── astro.config.mjs
├── package.json
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/
│   └── diagnose.mjs
└── src/
    ├── components/
    ├── config/
    ├── data/
    ├── lib/
    ├── layouts/
    └── pages/
        └── api/
```

## Requisitos

- Node.js 20.11.1 ou superior.
- npm.

## Desenvolvimento

```sh
npm install
npm run dev
```

O servidor local sobe em `http://127.0.0.1:4321`.

## Validacao

```sh
npm run diagnose
npm run lint
npm run test
npm run test:coverage
npm run build
```

- `npm run diagnose` verifica arquivos obrigatorios, scripts, dependencias, sintaxe do diagnostico, build Astro e disponibilidade da porta local.
- `npm run lint` executa `astro check`.
- `npm run test` executa a suite Vitest.
- `npm run test:coverage` mede cobertura dos helpers SSR em `src/lib` e proxies em `src/pages/api`.
- `npm run build` gera o bundle SSR em `dist/`.

## Build e preview

```sh
npm run build
npm run preview
```

O build gera o servidor Astro em `dist/`. As rotas em `src/pages/api` sao proxies SSR e nao devem ser chamadas diretamente pelo navegador com segredo.

## Configuracao

### Astro

- `SITE_URL`: origem publica do site. Padrao: `https://mateusrech255-sketch.github.io`.
- `SITE_BASE_PATH`: base path do deploy. Em desenvolvimento o padrao e `/`; em producao o padrao e `/site-da-fp-agency`.
- `INTERNAL_SECRET`: segredo server-only usado pelos proxies SSR para chamar o Worker.
- `PUBLIC_API_BASE`: base publica da API. Padrao: `https://api.fpagency.com.br`.

Exemplo local:

```sh
INTERNAL_SECRET=36a10466840fdf752327206541eb455e215426377873033846b846055e53beef \
PUBLIC_API_BASE=https://api.fpagency.com.br \
npm run dev
```

### Cloudflare Worker

Variaveis e segredos esperados no Worker `fp-agency-api`:

- `GOOGLE_SHEET_ID`: planilha principal do portal.
- `GOOGLE_REPORT_SHEET_ID`: planilha dedicada para relatorios mensais.
- `GOOGLE_CREDENTIALS`: JSON/base64 da conta de servico Google.
- `FIREBASE_API_KEY`: chave do Firebase Authentication.
- `FIREBASE_BUCKET_NAME`: bucket usado para validar fotos de perfil.
- `INTERNAL_SECRET`: segredo compartilhado com o SSR.
- `TIME_ZONE`: padrao recomendado `America/Sao_Paulo`.
- `ALLOWED_ORIGINS`: opcional.
- `ALLOW_LEGACY_PASSWORD_STORAGE`: opcional, padrao seguro desabilitado.

Exemplo de chamada real:

```sh
SECRET=36a10466840fdf752327206541eb455e215426377873033846b846055e53beef \
curl -H "Authorization: Bearer $SECRET" \
     "https://api.fpagency.com.br/api/buscar?codigo=66333"
```

## Deploy

O workflow principal esta em `.github/workflows/deploy.yml`. Ele instala dependencias, roda validacoes e publica o build conforme o ambiente configurado.

Para o Worker, rode na pasta `fp-agency-api`:

```sh
npm run lint
npm run test
npx wrangler deploy --keep-vars
```

Use `--keep-vars` para preservar variaveis criadas pelo dashboard, como `GOOGLE_REPORT_SHEET_ID`.
