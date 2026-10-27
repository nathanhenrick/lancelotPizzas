<template>
  <span :class="ativo ? 'badge-ativo' : 'badge-inativo'">{{ ativo ? 'Ativo' : 'Inativo' }}</span>
</template>

<script setup lang="ts">
defineProps<{ ativo: boolean }>()
</script>
