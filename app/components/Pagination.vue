<template>
  <nav class="pagination-bar d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 pt-3 mt-2 border-top" aria-label="Paginação">
    <div class="d-flex align-items-center gap-2">
      <label :for="idSelect" class="text-body-secondary small mb-0 text-nowrap">Itens por página</label>
      <select :id="idSelect" class="form-select form-select-sm pagination-page-size" :value="pageSize" @change="emit('update:pageSize', Number(($event.target as HTMLSelectElement).value))">
        <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
      </select>
    </div>

    <div class="text-body-secondary small text-nowrap">
      Mostrando <strong>{{ rangeStart }}–{{ rangeEnd }}</strong> de <strong>{{ total }}</strong>
    </div>

    <div class="d-flex align-items-center gap-1">
      <button type="button" class="btn btn-sm btn-outline-secondary pagination-btn" :disabled="page === 1" aria-label="Página anterior" title="Página anterior" @click="emit('update:page', page - 1)">
        <i class="bi bi-chevron-left" aria-hidden="true" />
      </button>
      <button
        v-for="p in visiblePages"
        :key="p"
        type="button"
        class="btn btn-sm pagination-btn"
        :class="p === page ? 'pagination-btn-active' : 'btn-outline-secondary'"
        :aria-current="p === page ? 'page' : undefined"
        :aria-label="`Página ${p}`"
        @click="emit('update:page', p)"
      >
        {{ p }}
      </button>
      <button type="button" class="btn btn-sm btn-outline-secondary pagination-btn" :disabled="page === totalPages" aria-label="Próxima página" title="Próxima página" @click="emit('update:page', page + 1)">
        <i class="bi bi-chevron-right" aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  page: number
  totalPages: number
  pageSize: number
  total: number
  rangeStart: number
  rangeEnd: number
  pageSizeOptions?: number[]
}>(), { pageSizeOptions: () => [10, 25, 50] })

const emit = defineEmits<{ 'update:page': [pagina: number], 'update:pageSize': [tamanho: number] }>()

const idSelect = useId()

const visiblePages = computed(() => {
  const inicio = Math.max(1, Math.min(props.page - 2, props.totalPages - 4))
  const fim = Math.min(props.totalPages, inicio + 4)
  return Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i)
})
</script>

<style>
.pagination-page-size {
  width: 5rem;
}

.pagination-btn {
  min-width: 2.25rem;
  min-height: 2.25rem;
}

.pagination-btn-active {
  background-color: var(--primary);
  border-color: var(--primary);
  color: var(--primary-fg);
}
</style>
