<template>
  <div class="palco">
    <div class="palco__pizza">
      <ClientOnly>
        <PizzaCanvas
          :visual="pedido.visual"
          :descricao="pedido.descricao"
          :interativa="pedido.etapa === 'montar' && !pedido.mostraEsfirras"
          @selecionar="pedido.abrirSeletor"
          @destaque="pedido.parteDestaque = $event"
          @pronta="podeGirar = $event === '3d'"
        />
        <template #fallback>
          <Loader class="palco__carregando" :tamanho="88" texto="Preparando a pizza…" />
        </template>
      </ClientOnly>
    </div>
    <div class="palco__dica">
      <span v-if="podeGirar" class="gesto" aria-hidden="true">
        <svg class="gesto__seta gesto__seta--esq" viewBox="0 0 24 24" width="18" height="18"><path d="M15 5l-7 7 7 7" /></svg>
        <span class="gesto__trilho"><span class="gesto__dedo" /></span>
        <svg class="gesto__seta gesto__seta--dir" viewBox="0 0 24 24" width="18" height="18"><path d="M9 5l7 7-7 7" /></svg>
      </span>
      <p class="palco__texto">
        <template v-if="podeGirar">Arraste para os lados para girar {{ pedido.mostraEsfirras ? 'as esfirras' : 'a pizza' }}.</template>
        <template v-if="pedido.etapa === 'montar' && !pedido.mostraEsfirras">
          Toque numa parte para escolher o sabor.
          <span class="palco__so-mouse">Passe o mouse sobre uma parte para ver o nome do sabor.</span>
          <span class="palco__so-toque">Segure o dedo numa parte para ver o nome do sabor.</span>
        </template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const pedido = usePedidoStore()

const podeGirar = ref(false)
</script>

<style scoped>
.palco {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: radial-gradient(ellipse at 50% 45%, var(--stage-glow) 0%, var(--bg) 70%);
}

.palco__pizza {
  flex: 1;
  min-height: 0;
  display: grid;
}

.palco__carregando {
  place-self: center;
  color: var(--muted);
}

.palco__dica {
  padding: 0 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--muted);
}

.palco__so-toque {
  display: inline;
}

.palco__so-mouse {
  display: none;
}

@media (hover: hover) and (pointer: fine) {
  .palco__so-mouse {
    display: inline;
  }

  .palco__so-toque {
    display: none;
  }
}

.gesto {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--fg);
}

.gesto__seta {
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.45;
}

.gesto__seta--esq {
  animation: seta-esq 1.8s ease-in-out infinite;
}

.gesto__seta--dir {
  animation: seta-dir 1.8s ease-in-out infinite;
}

.gesto__trilho {
  position: relative;
  width: 3.5rem;
  height: 0.25rem;
  border-radius: 999px;
  background: var(--border);
}

.gesto__dedo {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.875rem;
  height: 0.875rem;
  margin: -0.4375rem 0 0 -0.4375rem;
  border-radius: 50%;
  --dedo: #160f09;
  background: var(--dedo);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--dedo) 22%, transparent);
  animation: deslizar 1.8s ease-in-out infinite;
}

@keyframes deslizar {
  0%, 100% { transform: translateX(-1.4rem); }
  50% { transform: translateX(1.4rem); }
}

@keyframes seta-esq {
  0%, 10%, 100% { opacity: 1; transform: translateX(-2px); }
  40%, 60% { opacity: 0.35; transform: none; }
}

@keyframes seta-dir {
  0%, 40% { opacity: 0.35; transform: none; }
  50%, 60% { opacity: 1; transform: translateX(2px); }
  90%, 100% { opacity: 0.35; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .gesto__dedo,
  .gesto__seta--esq,
  .gesto__seta--dir {
    animation: none;
  }

  .gesto__seta {
    opacity: 0.8;
  }
}

@media (min-width: 900px) {
  .palco__dica {
    padding-bottom: 1.5rem;
    font-size: 0.9375rem;
  }
}
</style>

<style>
html.dark .gesto__dedo {
  --dedo: #f1e9dd;
}
</style>
