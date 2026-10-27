<template>
  <fieldset class="bordas">
    <legend class="titulo bordas__legenda">Borda</legend>
    <label v-for="b in cardapio.bordasAtivas" :key="b.id" class="bordas__op" :class="{ 'bordas__op--ativa': b.id === pedido.bordaAtual.id }">
      <input class="bordas__radio" type="radio" name="borda" :value="b.id" :checked="b.id === pedido.bordaAtual.id" @change="pedido.borda = b.id">
      <span class="bordas__nome">{{ b.nome }}</span>
      <span class="bordas__preco">{{ b[pedido.tamanho] ? `+ ${formatarPreco(b[pedido.tamanho])}` : 'Incluída' }}</span>
    </label>
  </fieldset>
</template>

<script setup lang="ts">
const pedido = usePedidoStore()
const cardapio = useCardapioStore()
</script>

<style scoped>
.bordas {
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bordas__legenda {
  padding: 0;
  margin-bottom: 0.5rem;
  font-size: 1.0625rem;
}

.bordas__op {
  min-height: 3rem;
  padding: 0 0.875rem;
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
}

.bordas__op--ativa {
  border-color: var(--primary);
  border-width: 2.5px;
}

.bordas__radio {
  width: 1.125rem;
  height: 1.125rem;
  margin: 0;
  accent-color: var(--primary);
}

.bordas__nome {
  flex: 1;
  font-weight: 500;
}

.bordas__preco {
  color: var(--muted);
}
</style>
