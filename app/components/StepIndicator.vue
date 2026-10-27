<template>
  <nav aria-label="Etapas do pedido">
    <ol class="etapas">
      <li
        v-for="(passo, i) in PASSOS"
        :key="passo.id"
        class="etapas__item"
        :class="{ 'etapas__item--atual': i === atual, 'etapas__item--feita': i < atual }"
        :aria-current="i === atual ? 'step' : undefined"
      >
        <span class="etapas__num" aria-hidden="true">
          <BaseIcon v-if="i < atual" nome="check" :tamanho="14" />
          <template v-else>{{ i + 1 }}</template>
        </span>
        <span class="etapas__nome">{{ passo.nome }}</span>
        <span v-if="i < atual" class="sr-only">(concluída)</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import type { Etapa } from '~/types/pizza'

const PASSOS: { id: Etapa, nome: string }[] = [
  { id: 'montar', nome: 'Pizza' },
  { id: 'extras', nome: 'Bebidas' },
  { id: 'pedido', nome: 'Pedido' }
]

const props = defineProps<{ etapa: Etapa }>()

const atual = computed(() => {
  const i = PASSOS.findIndex((p) => p.id === props.etapa)
  return i < 0 ? PASSOS.length : i
})
</script>

<style scoped>
.etapas {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 0.75rem;
}

.etapas__item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--muted);
}

.etapas__num {
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 50%;
  border: 1.5px solid var(--border-strong);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.etapas__item--atual {
  color: var(--fg);
}

.etapas__item--atual .etapas__num {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-fg);
}

.etapas__item--feita .etapas__num {
  background: var(--fg);
  border-color: var(--fg);
  color: var(--bg);
}

@media (max-width: 420px) {
  .etapas__item:not(.etapas__item--atual) .etapas__nome {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}

@media (max-width: 410px) {
  .etapas {
    gap: 0.375rem;
  }
}

@media (max-width: 360px) {
  .etapas__item--atual .etapas__nome {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
