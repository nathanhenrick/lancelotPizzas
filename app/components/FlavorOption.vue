<template>
  <button type="button" class="sabor" :class="{ 'sabor--ativo': selecionado }" :aria-pressed="selecionado">
    <span class="sabor__texto">
      <span class="sabor__nome">{{ sabor.nome }}</span>
      <span class="sabor__desc">{{ sabor.descricao }}</span>
    </span>
    <span class="sabor__lado">
      <span class="sabor__preco">{{ formatarPreco(preco) }}</span>
      <span class="sabor__faixa">{{ faixa }}</span>
    </span>
    <BaseIcon v-if="selecionado" nome="check" class="sabor__check" />
  </button>
</template>

<script setup lang="ts">
import type { Sabor } from '~/types/pizza'

defineProps<{ sabor: Sabor, preco: number, faixa: string, selecionado: boolean }>()
</script>

<style scoped>
.sabor {
  width: 100%;
  min-height: 3.75rem;
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  transition: border-color 0.2s ease;
}

.sabor:hover {
  border-color: var(--fg);
}

.sabor--ativo {
  border-color: var(--primary);
  border-width: 2.5px;
}

.sabor__texto {
  flex: 1;
}

.sabor__nome,
.sabor__desc,
.sabor__preco,
.sabor__faixa {
  display: block;
}

.sabor__nome,
.sabor__preco {
  font-weight: 600;
}

.sabor__desc,
.sabor__faixa {
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  color: var(--muted);
}

.sabor__lado {
  text-align: right;
  white-space: nowrap;
}

.sabor__check {
  color: var(--primary);
}
</style>
