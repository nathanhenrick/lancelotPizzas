<template>
  <a :href="alvo" class="skip-link"><slot /></a>
</template>

<script setup lang="ts">
defineProps<{ alvo: string }>()
</script>

<style scoped>
.skip-link {
  position: absolute;
  left: 0.5rem;
  top: -4rem;
  z-index: 100;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  background: var(--fg);
  color: var(--bg);
  font-weight: 600;
  text-decoration: none;
}

.skip-link:focus {
  top: 0.5rem;
}
</style>
