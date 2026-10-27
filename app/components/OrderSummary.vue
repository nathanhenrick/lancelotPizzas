<template>
  <div class="resumo">
    <ul class="resumo__linhas">
      <li v-for="linha in pedido.linhas" :key="linha.titulo" class="resumo__linha">
        <div>
          <p class="resumo__titulo">{{ linha.titulo }}</p>
          <p v-for="d in linha.detalhes" :key="d" class="resumo__detalhe">{{ d }}</p>
        </div>
        <p class="resumo__preco">{{ formatarPreco(linha.preco) }}</p>
      </li>
    </ul>
    <p class="resumo__total titulo">
      <span>Total</span>
      <span>{{ formatarPreco(pedido.total) }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
const pedido = usePedidoStore()
</script>

<style scoped>
.resumo {
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border);
  background: var(--surface);
}

.resumo__linhas {
  list-style: none;
  margin: 0;
  padding: 0;
}

.resumo__linha {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid var(--border);
}

.resumo__titulo,
.resumo__preco {
  font-weight: 600;
}

.resumo__preco {
  white-space: nowrap;
}

.resumo__detalhe {
  margin-top: 0.1875rem;
  font-size: 0.8125rem;
  color: var(--muted);
}

.resumo__total {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-size: 1.125rem;
}
</style>
