# Recrutador refatorado em componentes

Estrutura gerada:

```txt
src/
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── WhatsappFab.astro
│   └── views/
│       ├── Landing.astro
│       ├── Auth.astro
│       ├── Dashboard.astro
│       ├── Financeiro.astro
│       ├── Ranking.astro
│       ├── Configuracoes.astro
│       ├── Avisos.astro
│       ├── Editores.astro
│       ├── Links.astro
│       └── Diretrizes.astro
└── pages/
    └── recrutador.astro
```

Observações:

- `recrutador.astro` virou o shell principal.
- O JavaScript global, os modais, o loader, o header, o footer, a navegação inferior e o CSS global continuam no shell para evitar quebra das funções globais já usadas via `onclick`.
- `Auth.astro` reúne as telas `Login`, `Cadastro` e `Redefinir`, como solicitado.
- `Diretrizes.astro` foi mantido como tela separada porque o código original chama `nav('Diretrizes')` no Dashboard.
- `Header.astro`, `Footer.astro` e `WhatsappFab.astro` não foram recriados porque você informou que já existem.
