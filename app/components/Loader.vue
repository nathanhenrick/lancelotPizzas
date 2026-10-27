<template>
  <div class="loader" :class="{ 'loader--linha': linha }" role="status">
    <svg class="loader__pizza" :width="tamanho" :height="tamanho" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="47" class="loader__borda" />
      <circle cx="50" cy="50" r="41" class="loader__molho" />
      <g class="loader__fatias">
        <path v-for="f in FATIAS" :key="f.i" :d="f.d" class="loader__fatia" :style="{ animationDelay: `${f.i * 0.16}s` }" />
      </g>
      <g class="loader__calabresa">
        <circle v-for="c in CALABRESAS" :key="c.i" :cx="c.x" :cy="c.y" r="4.2" :style="{ animationDelay: `${c.i * 0.16 + 0.1}s` }" />
      </g>
    </svg>
    <span v-if="texto && !linha" class="loader__texto" aria-hidden="true">{{ texto }}</span>
    <span class="visually-hidden sr-only">{{ texto || 'Carregando…' }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ tamanho?: number, texto?: string, linha?: boolean }>(), { tamanho: 72, texto: 'Carregando…', linha: false })

const FATIAS_N = 8
const R = 39
const ponto = (grau: number, raio: number) => {
  const rad = ((grau - 90) * Math.PI) / 180
  return { x: +(50 + raio * Math.cos(rad)).toFixed(2), y: +(50 + raio * Math.sin(rad)).toFixed(2) }
}

const FATIAS = Array.from({ length: FATIAS_N }, (_, i) => {
  const passo = 360 / FATIAS_N
  const a = ponto(i * passo + 1.6, R)
  const b = ponto((i + 1) * passo - 1.6, R)
  const c = ponto(i * passo + passo / 2, 3)
  return { i, d: `M${c.x} ${c.y} L${a.x} ${a.y} A${R} ${R} 0 0 1 ${b.x} ${b.y} Z` }
})

const CALABRESAS = Array.from({ length: FATIAS_N }, (_, i) => ({ i, ...ponto(i * (360 / FATIAS_N) + 22.5, 24) }))
</script>

<style scoped>
.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 0;
  color: var(--muted, #6c757d);
  font-size: 0.875rem;
}

.loader--linha {
  display: inline-flex;
  padding: 0;
  vertical-align: middle;
}

.loader__pizza {
  animation: girar 4.8s linear infinite;
  overflow: visible;
}

.loader__borda {
  fill: #d9a05b;
}

.loader__molho {
  fill: #a3261a;
}

.loader__fatia {
  fill: #f6d272;
  transform-box: view-box;
  transform-origin: 50px 50px;
  animation: fatia 1.8s ease-in-out infinite;
}

.loader__calabresa circle {
  fill: #b03a22;
  stroke: #8d2a17;
  stroke-width: 0.8;
  transform-box: fill-box;
  transform-origin: center;
  animation: calabresa 1.8s ease-in-out infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

@keyframes fatia {
  0% { opacity: 0; transform: scale(0.55); }
  18%, 70% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1); }
}

@keyframes calabresa {
  0%, 12% { opacity: 0; transform: scale(0); }
  30%, 70% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .loader__pizza,
  .loader__fatia,
  .loader__calabresa circle {
    animation: none;
  }
}
</style>
