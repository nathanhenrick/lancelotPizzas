<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : 'button'"
    :target="href && externo ? '_blank' : undefined"
    :rel="href && externo ? 'noopener' : undefined"
    class="botao"
    :class="[`botao--${variante}`, { 'botao--bloco': bloco }]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variante?: 'primario' | 'sucesso' | 'contorno' | 'texto'
  href?: string
  externo?: boolean
  bloco?: boolean
}>(), { variante: 'primario' })
</script>

<style scoped>
.botao {
  min-height: 3.25rem;
  padding: 0 1.375rem;
  border-radius: var(--radius-lg);
  border: 1.5px solid transparent;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: transform 0.15s ease, background-color 0.2s ease, opacity 0.2s ease;
}

.botao:not(:disabled):hover {
  transform: translateY(-1px);
}

.botao--bloco {
  width: 100%;
}

.botao--primario {
  background: var(--primary);
  color: var(--primary-fg);
}

.botao--sucesso {
  background: var(--success);
  color: var(--success-fg);
}

.botao--contorno {
  background: transparent;
  color: var(--fg);
  border-color: var(--border-strong);
}

.botao--texto {
  min-height: 2.75rem;
  padding: 0;
  background: transparent;
  color: var(--fg);
}

.botao:disabled {
  background: var(--surface-2);
  color: var(--muted);
  border-color: var(--border);
}
</style>
