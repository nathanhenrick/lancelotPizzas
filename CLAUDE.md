# Lancelot Pizzas — Frontend

Site de pedidos de pizzaria (pizza, esfirras e bebidas) com painel administrativo, evoluindo para um SaaS multi-tenant. O backend é a API Laravel em `../backendMontaPizza`.

## Trabalhando com o backend na mesma sessão

Se `../backendMontaPizza` estiver adicionado à sessão, o `CLAUDE.md` dele **não é carregado sozinho** (só as skills são). Antes de ler, alterar ou auditar qualquer arquivo daquela pasta, leia `../backendMontaPizza/CLAUDE.md` e siga as regras dele (arquitetura da API, multi-tenancy, segurança e processo). Mudanças que cruzam os dois lados (ex.: novo campo do cardápio) seguem: migration e API primeiro, depois `types/pizza.ts`, `services/`, store e tela.

## Stack real (confira antes de assumir outra coisa)

- Nuxt 4 + Vue 3 + TypeScript, Pinia, axios, three.js, Bootstrap (só nos layouts do painel).
- Módulos: `@nuxt/a11y`, `@nuxt/fonts`, `@nuxtjs/color-mode`, `@pinia/nuxt`.
- Páginas públicas têm SSR (`/`, `/pizza`, `/esfirras`, `/sobre`); `/admin/**` roda com `ssr: false` (`routeRules` em `nuxt.config.ts`).
- Não há suíte de testes nem lint configurados: os scripts são `dev`, `build`, `generate` e `preview`. A verificação mínima é `npx nuxt build` e conferir a tela no navegador. Não diga que testes passaram sem rodá-los.
- Mapa do código e do painel: `README.md`.

## Regras de desenvolvimento

- Leia a estrutura e os padrões existentes antes de alterar. Reutilize componentes, composables, utils e `services/`.
- Não troque bibliotecas nem refatore o que não for da tarefa.
- Preserve pedidos, personalização de sabores e esfirras, adicionais, tamanhos e preços.
- Preços e totais do frontend são só prévia: a API recalcula (`stores/pedido.ts` só envia escolhas). Nunca trate o total do navegador como fonte confiável.
- Dados novos do cardápio seguem o fluxo: tipo em `types/pizza.ts` → `services/` → `stores/cardapio.ts` → tela do painel em `pages/admin/`.
- Não coloque segredos em `runtimeConfig.public`. O token do painel fica no cookie gerenciado por `stores/auth.ts`.
- Mudanças visuais em 3D ficam em `lib/pizza/`; dados que o painel usa ficam fora dela (`data/`) para não baixar o three.js.

## SEO

- Otimize só páginas públicas. Metadados únicos por página (`useHead`/`useSeoMeta`), `canonical`, sitemap e `robots.txt` quando aplicável.
- Estado atual conhecido: `public/robots.txt` libera tudo (inclusive `/admin`) e não há sitemap nem dados estruturados. Corrija isso via skill `seo` quando for pedido.
- O conteúdo importante precisa existir no HTML do servidor.
- O painel (`/admin/**`) e páginas privadas nunca devem ser indexados (`noindex`).

## Acessibilidade (objetivo: WCAG 2.2 AA)

- Navegação por teclado, foco visível, contraste, labels, HTML semântico.
- Mudanças dinâmicas são anunciadas por `useAnuncio`; o 3D sempre tem alternativa por lista/botões (`PartList`, `ProdutoLista`); respeite `prefers-reduced-motion` (`useReducedMotion`).
- Não dependa só de cor, animação ou do 3D para passar informação.

## Performance

- Core Web Vitals. O three.js e as cenas só carregam quando a pizza/esfirra aparece; não antecipe.
- Atenção a texturas em canvas, a liberar GPU em `destruir()` e a hidratação do SSR.
- Preserve o funcionamento em celular.

## Segurança

- Nada vindo do navegador é confiável (preço, permissão, loja). A validação e a autorização são da API.
- Hoje o projeto atende uma única pizzaria. Quando virar multi-tenant, nunca exiba dados de outra loja e não envie identificador de tenant como único controle de acesso.

## Processo

- Antes de modificar, explique brevemente a abordagem.
- Ao terminar, informe arquivos alterados, o que foi verificado e as limitações. Não declare algo verificado sem ter executado.
- Quando o pedido for uma auditoria, não altere código: entregue achados com evidência, gravidade e plano.

## Skills deste repositório (`.claude/skills/`)

- `seo` — auditoria e correção de SEO técnico das páginas públicas.
- `front-a11y` — auditoria e correção de acessibilidade (WCAG 2.2 AA), inclusive do 3D.
- `web-performance` — auditoria de performance e Core Web Vitals, inclusive three.js.
