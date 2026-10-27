<template>
  <button type="button" class="primary_button" :disabled="carregando || undefined" :aria-busy="carregando || undefined">
    <Loader v-if="carregando" linha :tamanho="18" texto="Salvando…" />
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ carregando?: boolean }>()
</script>

<style>
.primary_button {
  border: 1px solid var(--primary);
  border-radius: 0.5rem;
  color: var(--primary-fg);
  background-color: var(--primary);
  padding: 0.4rem 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease-in-out;
}

.primary_button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.18);
}

.primary_button:disabled {
  opacity: 0.6;
}
</style>
