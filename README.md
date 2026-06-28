# FP Agency

Site institucional e portal da FP Agency construidos com Astro. O projeto atual e estatico e publica paginas de apresentacao, monetizacao, inscricao, busca, treinamento e area do recrutador.

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
    ├── data/
    │   └── videos.json
    ├── layouts/
    └── pages/
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
npm run check
```

- `npm run diagnose` verifica arquivos obrigatorios, scripts, dependencias, sintaxe do diagnostico, build Astro e disponibilidade da porta local.
- `npm run check` executa `astro check` e depois `astro build`.

## Build e preview

```sh
npm run build
npm run preview
```

O build gera os arquivos estaticos em `dist/`.

## Configuracao

O build usa:

- `SITE_URL`: origem publica do site. Padrao: `https://mateusrech255-sketch.github.io`.
- `SITE_BASE_PATH`: base path do deploy. Em desenvolvimento o padrao e `/`; em producao o padrao e `/site-da-fp-agency`.

Exemplo para GitHub Pages:

```sh
SITE_URL=https://mateusrech255-sketch.github.io SITE_BASE_PATH=/site-da-fp-agency npm run build
```

## Deploy

O workflow principal de GitHub Pages esta em `.github/workflows/deploy.yml`. Ele instala dependencias, roda `npm run check`, envia `dist/` como artefato e publica no Pages.

O workflow `.github/workflows/static.yml` fica apenas como checagem de build em push e pull request, sem publicar artefatos.
