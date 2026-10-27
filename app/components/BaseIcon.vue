<template>
  <svg
    :width="tamanho"
    :height="tamanho"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="d in ICONES[nome]" :key="d" :d="d" />
  </svg>
</template>

<script setup lang="ts">
const ICONES = {
  sol: ['M12 3v2', 'M12 19v2', 'M3 12h2', 'M19 12h2', 'M5.6 5.6l1.4 1.4', 'M17 17l1.4 1.4', 'M5.6 18.4L7 17', 'M17 7l1.4-1.4', 'M12 8a4 4 0 100 8 4 4 0 000-8z'],
  lua: ['M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z'],
  auto: ['M12 3a9 9 0 100 18 9 9 0 000-18z', 'M12 3v18', 'M12 7h4.5', 'M12 11h6', 'M12 15h5.5'],
  fechar: ['M6 6l12 12', 'M18 6L6 18'],
  voltar: ['M15 5l-7 7 7 7'],
  avancar: ['M5 12h14', 'M13 6l6 6-6 6'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  mais: ['M12 5v14', 'M5 12h14'],
  menos: ['M5 12h14'],
  enviar: ['M4 12l16-8-6 16-3-7-7-1z'],
  info: ['M12 3a9 9 0 100 18 9 9 0 000-18z', 'M12 11v5', 'M12 8h.01']
} as const

withDefaults(defineProps<{ nome: keyof typeof ICONES, tamanho?: number }>(), { tamanho: 20 })
</script>
