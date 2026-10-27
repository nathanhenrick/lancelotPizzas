<template>
  <div class="acoes">
    <button type="button" class="btn btn-sm acoes__editar" :title="`Editar ${nome}`" :aria-label="`Editar ${nome}`" @click="emit('editar')">
      <i class="bi bi-pencil" aria-hidden="true" />
    </button>
    <button type="button" class="btn btn-sm acoes__excluir" :title="`Excluir ${nome}`" :aria-label="`Excluir ${nome}`" @click="emit('excluir')">
      <i class="bi bi-trash" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ nome: string }>()

const emit = defineEmits<{ editar: [], excluir: [] }>()
</script>

<style scoped>
.acoes {
  display: inline-flex;
  gap: 0.375rem;
}

.acoes .btn {
  width: 2.25rem;
  height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.acoes__editar {
  background: var(--bs-secondary-bg);
  border: 1px solid var(--bs-border-color);
  color: var(--bs-emphasis-color);
}

.acoes__editar:hover,
.acoes__editar:focus-visible {
  background: var(--bs-tertiary-color);
  border-color: var(--bs-tertiary-color);
  color: var(--bs-body-bg);
}

.acoes__excluir {
  background: #c62828;
  border: 1px solid #c62828;
  color: #fff;
}

.acoes__excluir:hover,
.acoes__excluir:focus-visible {
  background: #a31f1f;
  border-color: #a31f1f;
  color: #fff;
}
</style>
