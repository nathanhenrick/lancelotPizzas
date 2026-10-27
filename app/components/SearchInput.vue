<template>
  <div class="search_input d-flex" role="search">
    <button type="button" class="px-3 py-1" aria-label="Pesquisar" @click="emit('search')">
      <i class="bi bi-search" aria-hidden="true" />
    </button>
    <input
      type="search"
      :placeholder="placeholder"
      :aria-label="placeholder"
      :value="modelValue"
      @input="aoDigitar(($event.target as HTMLInputElement).value)"
      @keyup.enter="emit('search')"
    >
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ modelValue?: string, placeholder?: string }>(), { modelValue: '', placeholder: 'Pesquisar' })

const emit = defineEmits<{ 'update:modelValue': [valor: string], search: [] }>()

function aoDigitar(valor: string) {
  emit('update:modelValue', valor)
  emit('search')
}
</script>

<style>
.search_input {
  background-color: var(--lGray);
  font-size: 14px;
  width: fit-content;
  border: 1px solid transparent;
  border-radius: 0.5rem;
}

.search_input button,
.search_input input {
  border: none;
  background-color: transparent;
  color: inherit;
  min-height: 2.5rem;
}

.search_input input:focus {
  outline: none;
}

.search_input:focus-within {
  background-color: var(--bs-body-bg);
  border-color: var(--bs-border-color);
  outline: 3px solid var(--bs-body-color);
  outline-offset: 2px;
}
</style>
