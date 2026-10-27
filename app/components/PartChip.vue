<template>
  <button
    type="button"
    class="parte"
    :class="{ 'parte--vazia': !sabor, 'parte--realce': realce }"
    :aria-label="rotulo"
  >
    <span class="parte__fracao titulo" aria-hidden="true">{{ fracao }}</span>
    <span class="parte__nome">{{ sabor?.nome ?? 'Escolher sabor' }}</span>
    <span v-if="ajustado" class="parte__tag" aria-hidden="true">alterado</span>
    <BaseIcon v-if="!sabor" nome="mais" :tamanho="18" />
  </button>
</template>

<script setup lang="ts">
import type { Sabor } from '~/types/pizza'

const props = defineProps<{
  indice: number
  total: number
  fracao: string
  sabor: Sabor | null
  realce: boolean
  ajustado?: boolean
}>()

const rotulo = computed(() => {
  const visivel = `${props.fracao} ${props.sabor?.nome ?? 'Escolher sabor'}`
  const onde = props.total === 1 ? '' : `, parte ${props.indice + 1} de ${props.total}`
  return props.sabor ? `${visivel}${onde}${props.ajustado ? ', com alterações' : ''}. Trocar sabor` : `${visivel}${onde}`
})
</script>

<style scoped>
.parte__tag {
  flex: none;
  padding: 0.0625rem 0.4375rem;
  border-radius: 999px;
  background: var(--surface-2);
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--accent-text);
}

.parte {
  min-height: 3.25rem;
  padding: 0 0.75rem;
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-align: left;
  transition: border-color 0.2s ease;
}

.parte--vazia {
  border-style: dashed;
  border-color: var(--border-strong);
  color: var(--muted);
}

.parte--realce,
.parte:hover {
  border-color: var(--fg);
  border-style: solid;
}

.parte__fracao {
  min-width: 2rem;
  font-size: 0.9375rem;
  color: var(--accent-text);
}

.parte__nome {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.2;
}
</style>
