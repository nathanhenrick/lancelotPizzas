<template>
  <div class="card border h-100 p-3 rounded-3">
    <div class="stat-corpo d-flex align-items-center justify-content-between gap-2">
      <div class="stat-texto">
        <div class="stat-rotulo text-uppercase fw-bold text-body-secondary mb-1">{{ rotulo }}</div>
        <div class="stat-valor fw-bold">{{ carregando ? '-' : valor }}</div>
      </div>
      <div class="stat-icon" :class="`stat-icon--${cor}`" aria-hidden="true">
        <i :class="['bi', icone, 'fs-5']" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  rotulo: string
  valor: string | number
  icone: string
  cor?: 'primaria' | 'escura'
  carregando?: boolean
}>(), { cor: 'primaria' })
</script>

<style scoped>
.stat-texto {
  min-width: 0;
}

.stat-valor {
  font-size: 1.25rem;
  line-height: 1.2;
  white-space: nowrap;
}

@media (min-width: 576px) {
  .stat-valor {
    font-size: 1.5rem;
  }
}

@media (max-width: 575.98px) {
  .stat-corpo {
    flex-direction: column-reverse;
    align-items: flex-start !important;
  }

  .stat-icon {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.625rem;
  }
}

.stat-rotulo {
  font-size: 0.72rem;
  letter-spacing: 0.04em;
}

.stat-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}

.stat-icon--primaria {
  background: var(--primary);
}

.stat-icon--escura {
  background: var(--bs-emphasis-color);
  color: var(--bs-body-bg);
}
</style>
