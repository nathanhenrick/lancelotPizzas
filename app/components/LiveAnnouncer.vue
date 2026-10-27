<template>
  <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ mensagem }}</div>
</template>

<script setup lang="ts">
const { mensagem } = useAnuncio()
</script>
