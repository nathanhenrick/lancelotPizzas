---
name: front-a11y
description: Audita e corrige a acessibilidade (WCAG 2.2 AA) do frontend Lancelot Pizzas em Nuxt/Vue, incluindo o montador 3D (three.js), formulários, modais, foco, contraste e leitor de tela. Use para acessibilidade, WCAG, teclado, leitor de tela, contraste ou revisão de componentes novos.
---

# Acessibilidade — Lancelot Pizzas (WCAG 2.2 AA)

## Quando usar
Pedidos de acessibilidade, ou ao criar/alterar telas, componentes, modais, formulários e interações 3D.

## O que já existe (reaproveite, confirme no código)
- `@nuxt/a11y` (avisos no DevTools em `npm run dev`).
- `SkipLink`, `LiveAnnouncer` + `useAnuncio` (anúncios), `useReducedMotion`, foco gerenciado em `FlavorPicker`/`EsfirraAjuste` (foco no título ao abrir, volta ao fechar), alternativa em lista ao 3D (`PartList`, `ProdutoLista`), `SegmentedControl` com radios nativos.

## Procedimento
1. **Mapear o escopo**: páginas `/`, `/pizza`, `/esfirras`, `/sobre`, `/login` e o painel `/admin/**` (a landing, o login e o painel usam Bootstrap).
2. **Teclado**: percorra com Tab/Shift+Tab/Enter/Espaço/Esc. Nada fica inalcançável; ordem lógica; foco visível (≥ 3:1) e nunca preso fora de modais; Esc fecha overlays; o que fica atrás de um overlay está `inert`.
3. **Semântica e nomes**: um `h1` por página, hierarquia de títulos, landmarks (`main`, `header`, `nav`), botões vs links corretos, todo controle com nome acessível (texto visível dentro do nome — WCAG 2.5.3), `aria-pressed`/`aria-selected` coerentes, `aria-live` só onde há atualização relevante.
4. **Formulários**: `label` associado, obrigatoriedade indicada além da cor, erros descritos em texto e ligados ao campo (`aria-describedby`/`aria-invalid`), sem perda de dados ao errar.
5. **Contraste e cor**: texto ≥ 4,5:1 (grande ≥ 3:1), componentes/foco ≥ 3:1, nos temas claro **e** escuro; informação nunca só por cor.
6. **3D e movimento**: tudo que se faz no 3D tem equivalente por teclado/leitor de tela; descrição textual do estado (`descricao` em `stores/pedido.ts`); `prefers-reduced-motion` desliga animações; sem piscar; alvo de toque ≥ 24×24 px (ideal 44).
7. **Reflow e zoom**: 320 px de largura sem rolagem horizontal; zoom 200% sem perda; `viewport` sem bloquear zoom.
8. **Ferramentas** (use só as que existirem; verifique antes de afirmar): avisos do `@nuxt/a11y`, inspeção da árvore de acessibilidade no navegador, leitura do DOM. Não declare "WCAG AA conforme" sem verificação manual: ferramentas automáticas cobrem só parte dos critérios.
9. **Corrigir** o que for pedido, com mudanças mínimas, e rodar `npx nuxt build`.

## Critérios de aprovação
- Fluxo completo pedido (escolher produto → montar → bebidas → enviar) por teclado, sem armadilha de foco.
- Sem controles sem nome; contraste conforme acima nos dois temas; movimento respeita preferência do sistema.
- Alternativa não visual ao 3D funcionando.

## Relatório
```
## Acessibilidade — <data>
Escopo e como foi testado (teclado, leitor de tela se houve, temas)
| # | Critério WCAG | Onde (arquivo/tela) | Problema | Gravidade | Correção |
Alterações feitas
Verificado vs. não verificado (seja explícito)
```
