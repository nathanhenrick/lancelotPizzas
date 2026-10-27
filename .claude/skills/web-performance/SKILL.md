---
name: web-performance
description: Audita performance e Core Web Vitals (LCP, INP, CLS) do frontend Lancelot Pizzas em Nuxt 4 com three.js: carregamento do 3D, tamanho de bundle, texturas em canvas, memória da GPU, hidratação SSR e imagens/fontes. Use para lentidão, peso da página, Lighthouse, Web Vitals ou jank nas cenas 3D.
---

# Performance — Lancelot Pizzas

## Quando usar
Pedidos sobre velocidade, peso, Lighthouse, Web Vitals, travadas no 3D, uso de memória/bateria no celular.

## Pontos conhecidos do projeto (confirme no código)
- `lib/pizza/renderer.ts` (cena three.js) e `PizzaCanvas.vue` só carregam no cliente (`ClientOnly`); `data/` guarda o que o painel usa para não baixar o three.js.
- Texturas em canvas (pizza 1024 px, rótulos de bebida, recheio de esfirra) e `renderer.destruir()` libera GPU.
- A cena entra com animação por `requestAnimationFrame` e dorme quando está parada (`pedirQuadro`).
- Fontes pelo `@nuxt/fonts`; imagens estáticas em `public/` (`img/*.svg`, logos SVG).

## Procedimento
1. **Medir antes de mexer**: `npx nuxt build` e leia o tamanho dos chunks da saída; no navegador, use a aba Performance/Network (e Lighthouse se disponível). Registre números antes/depois. Sem medição, é palpite: diga que é hipótese.
2. **LCP**: qual elemento é o maior em `/`, `/pizza`, `/esfirras`? Imagens com dimensões, formato leve, `fetchpriority` onde fizer sentido; fontes sem bloquear (swap).
3. **CLS**: reserve espaço do canvas/imagens; evite trocar o layout depois da hidratação (ex.: palco 3D que aparece/some).
4. **INP**: interações no painel e no seletor não devem fazer trabalho pesado no thread principal; evite recomputar listas grandes; `watch`/`computed` sem dependências desnecessárias.
5. **three.js**: três.js carregado sob demanda; reutilizar geometrias/materiais, descartar texturas e geometrias ao remontar (`dispose`), limitar `pixelRatio` (já em 2), poucas luzes/sombras, número de objetos (as bebidas e esfirras têm teto). Procure vazamentos: monte/desmonte a tela várias vezes e observe a memória.
6. **Rede e SSR**: o cardápio é buscado em paralelo (`stores/cardapio.ts`); avalie cache, tamanho do payload (as logos de bebida são data URL dentro do JSON) e chamadas duplicadas.
7. **Celular**: simule rede lenta/CPU reduzida e confirme que o fluxo continua usável.
8. **Corrigir** só com ganho medido, mudança mínima e `npx nuxt build` verde.

## Critérios de aprovação
- Medições antes/depois registradas; sem regressão funcional nem de acessibilidade.
- Nenhum vazamento evidente ao navegar entre `/pizza` e `/esfirras`.
- Metas orientativas (campo): LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1. Diga que são metas e como foram (ou não) medidas.

## Relatório
```
## Performance — <data>
Ambiente e método de medição
| Página/cena | Métrica | Antes | Depois | Mudança |
Principais gargalos (com evidência)
Alterações feitas
Não medido / hipóteses
```
