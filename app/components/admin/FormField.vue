<template>
  <div class="d-flex flex-column">
    <label :for="id" class="fw-semibold mb-1">
      {{ rotulo }} <template v-if="obrigatorio"><span class="obrigatorio" aria-hidden="true">*</span><span class="visually-hidden">(obrigatório)</span></template>
    </label>
    <slot :id="id" :invalido="Boolean(erro)" :descrito-por="erro ? `${id}-erro` : ajuda ? `${id}-ajuda` : undefined" />
    <span v-if="erro" :id="`${id}-erro`" class="text-danger small mt-1" role="alert">{{ erro }}</span>
    <span v-else-if="ajuda" :id="`${id}-ajuda`" class="text-body-secondary small mt-1">{{ ajuda }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ rotulo: string, erro?: string, ajuda?: string, obrigatorio?: boolean }>()

const id = useId()
</script>
