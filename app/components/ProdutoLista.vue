<template>
  <section v-if="itens.length" :aria-labelledby="`${idBase}-titulo`">
    <h3 :id="`${idBase}-titulo`" class="titulo produtos__titulo">{{ titulo }}</h3>
    <ul class="produtos">
      <li v-for="item in itens" :key="item.id" class="produtos__item">
        <div class="produtos__texto">
          <p class="produtos__nome">{{ item.nome }}</p>
          <p v-if="item.descricao" class="produtos__desc">{{ item.descricao }}</p>
          <p class="produtos__preco">{{ formatarPreco(item.preco) }}</p>
          <button v-if="item.personalizavel && (quantidades[item.id] ?? 0) > 0" type="button" class="produtos__ajuste" @click="emit('personalizar', item.id)">
            {{ item.alterado ? 'Alterado · editar' : 'Tirar ou somar ingredientes' }}
          </button>
        </div>
        <QuantityStepper
          :model-value="quantidades[item.id] ?? 0"
          :rotulo="item.nome"
          :max="max"
          @update:model-value="emit('alterar', item.id, $event)"
        />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  idBase: string
  titulo: string
  itens: { id: number | string, nome: string, descricao?: string, preco: number, personalizavel?: boolean, alterado?: boolean }[]
  quantidades: Record<number | string, number>
  max?: number
}>(), { max: 20 })

const emit = defineEmits<{ alterar: [id: any, quantidade: number], personalizar: [id: any] }>()
</script>

<style scoped>
.produtos__titulo {
  margin-bottom: 0.5rem;
  font-size: 1.0625rem;
}

.produtos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.produtos__item {
  min-height: 3.25rem;
  padding: 0.25rem 0.375rem 0.25rem 0.875rem;
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.produtos__texto {
  flex: 1;
}

.produtos__nome {
  font-weight: 500;
}

.produtos__desc {
  font-size: 0.8125rem;
  color: var(--muted);
  line-height: 1.3;
}

.produtos__ajuste {
  margin-top: 0.375rem;
  min-height: 2rem;
  padding: 0 0.75rem;
  border-radius: 999px;
  border: 1.5px solid var(--border-strong);
  background: transparent;
  color: var(--fg);
  font-size: 0.8125rem;
  font-weight: 600;
}

.produtos__preco {
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent-text);
}
</style>
