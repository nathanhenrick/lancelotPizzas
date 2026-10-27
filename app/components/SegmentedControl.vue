<template>
  <fieldset class="seg">
    <legend class="sr-only">{{ legenda }}</legend>
    <label
      v-for="op in opcoes"
      :key="op.valor"
      class="seg__op"
      :class="{ 'seg__op--ativa': op.valor === modelValue }"
    >
      <input
        class="sr-only"
        type="radio"
        :name="nome"
        :value="op.valor"
        :checked="op.valor === modelValue"
        @change="emit('update:modelValue', op.valor)"
      >
      <span class="seg__rotulo">{{ op.rotulo }}</span>
      <span v-if="op.detalhe" class="seg__detalhe">{{ op.detalhe }}</span>
    </label>
  </fieldset>
</template>

<script setup lang="ts" generic="T extends string">
defineProps<{
  modelValue: T | null
  opcoes: { valor: T, rotulo: string, detalhe?: string }[]
  legenda: string
  nome: string
}>()

const emit = defineEmits<{ 'update:modelValue': [valor: T] }>()
</script>

<style scoped>
.seg {
  margin: 0;
  padding: 0.25rem;
  border: 0;
  border-radius: var(--radius-lg);
  background: var(--surface-2);
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 0.375rem;
}

.seg__op {
  min-height: 2.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.625rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.seg__rotulo {
  font-weight: 600;
  font-size: 0.9375rem;
}

.seg__detalhe {
  font-size: 0.75rem;
  color: var(--muted);
}

.seg__op--ativa {
  background: var(--primary);
  color: var(--primary-fg);
}

.seg__op--ativa .seg__detalhe {
  color: var(--primary-fg);
}

.seg__op:has(input:focus-visible) {
  outline: 3px solid var(--fg);
  outline-offset: 2px;
}
</style>
