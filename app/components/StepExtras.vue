<template>
  <div class="etapa">
    <BaseButton variante="texto" class="etapa__voltar" @click="pedido.irPara('montar')">
      <BaseIcon nome="voltar" :tamanho="18" /> Voltar
    </BaseButton>
    <h2 id="titulo-etapa" class="sr-only" tabindex="-1">Bebidas</h2>
    <ProdutoLista id-base="bebidas" titulo="Bebidas" :itens="cardapio.bebidasAtivas" :quantidades="pedido.bebidas" @alterar="pedido.definirBebida" />
  </div>
</template>

<script setup lang="ts">
const pedido = usePedidoStore()
const cardapio = useCardapioStore()
</script>

<style scoped>
.etapa {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.etapa__voltar {
  align-self: flex-start;
}
</style>
