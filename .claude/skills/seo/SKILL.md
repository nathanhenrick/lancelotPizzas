---
name: seo
description: Audita e corrige o SEO técnico das páginas públicas do Lancelot Pizzas (Nuxt 4 com SSR): metadados, canonical, robots.txt, sitemap, dados estruturados, Open Graph e indexação do painel. Use quando pedirem SEO, indexação, Google, compartilhamento em redes, sitemap ou robots.
---

# SEO técnico — Lancelot Pizzas (Nuxt 4)

## Quando usar
Pedidos sobre SEO, indexação, metadados, sitemap, robots, dados estruturados, preview de link, ou "o Google não acha o site".

## Escopo
- Públicas: `/`, `/pizza`, `/esfirras`, `/sobre`. Privadas (não indexar): `/admin/**`.
- Cardápio, preços e horários vêm da API e são renderizados no servidor; confirme o HTML real (view-source) em vez de supor.

## Procedimento
1. **Levantar o estado real**: `app/app.vue` (`titleTemplate`), `useHead`/`useSeoMeta` em `pages/`, `nuxt.config.ts` (`app.head`, `routeRules`, módulos), `public/robots.txt`. Liste o que existe e o que falta; não invente módulos instalados.
2. **Conferir o HTML servido**: rode `npm run dev` (ou `npm run build && npm run preview`) e leia o HTML de cada página pública (`curl` ou navegador → código-fonte). Verifique `<title>`, `meta description`, `canonical`, `lang`, `h1` único, conteúdo do cardápio presente sem JavaScript.
3. **Checklist por página**: título único (≤ ~60 caracteres), descrição única (≤ ~155), `canonical` absoluta, Open Graph/Twitter (`og:title`, `og:description`, `og:image`, `og:url`), `h1` coerente, imagens com `alt` (as decorativas, `alt=""`), links internos rastreáveis (`<a href>`).
4. **Indexação**:
   - `robots.txt` com `Disallow: /admin` e referência ao sitemap. Estado conhecido ao escrever esta skill: o arquivo libera tudo.
   - `/admin/**` com `noindex` (cabeçalho via `routeRules` ou `useHead`), além do robots.
   - Páginas de erro/404 sem indexação.
5. **Sitemap**: gere só URLs públicas (por padrão exige o módulo `@nuxtjs/sitemap`; proponha e peça confirmação antes de instalar dependência).
6. **Dados estruturados** (JSON-LD via `useHead`): `Restaurant`/`LocalBusiness` com nome, endereço, telefone, horários e redes (dados vêm de `cardapio.config`); `Menu`/`MenuItem` só se o conteúdo for fiel ao que a página mostra. Valide o JSON (sintaxe) e não declare dados que a página não exibe.
7. **Aplicar correções mínimas** (se a tarefa pedir correção) e rodar `npx nuxt build`.

## Critérios de aprovação
- Todas as páginas públicas têm título, descrição e canonical únicos; HTML do servidor contém o conteúdo principal.
- `/admin` bloqueado em `robots.txt` e com `noindex`; sitemap lista só páginas públicas.
- JSON-LD é JSON válido e só descreve o que a página mostra.
- `npx nuxt build` passa. Nenhuma regressão visual.

## Relatório
```
## SEO — <data>
Resumo (3 linhas)
| Página | Problema | Evidência (arquivo/linha ou trecho do HTML) | Impacto | Correção |
Alterações feitas (arquivos)
Verificações executadas (comandos e resultado)
Pendências / o que não foi possível verificar (ex.: ferramentas externas como Search Console)
```
Não afirme melhoria de ranking: só o que foi verificado no HTML e nas regras.
