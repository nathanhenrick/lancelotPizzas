<template>
  <div class="previa">
    <ClientOnly>
      <PizzaCanvas :visual="visualSuave" :descricao="descricao" :interativa="false" :animar="false" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { PizzaVisual } from '~/types/pizza'

const props = defineProps<{ cor: number, nome: string }>()

const visual = computed<PizzaVisual>(() => ({
  qtd: 1,
  partes: [null],
  escala: 1,
  corRecheio: null,
  destaque: -1,
  modo: 'esfirra',
  esfirras: [{ id: 0, cor: props.cor, quantidade: 1 }]
}))

const visualSuave = useVisualSuave(visual)

const descricao = computed(() => `Prévia: ${props.nome || 'esfirra'} na tábua.`)
</script>

<style scoped>
.previa {
  height: 240px;
  border-radius: 0.5rem;
  background: var(--bs-tertiary-bg);
  display: grid;
}
</style>
