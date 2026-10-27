<template>
  <Montador titulo="Peça suas esfirras" />
</template>

<script setup lang="ts">
const pedido = usePedidoStore()
const cardapio = useCardapioStore()

if (!cardapio.esfirrasAtivas.length) {
  await navigateTo('/pizza', { replace: true })
} else {
  pedido.produto = 'esfirra'
}

usePaginaSeo({
  titulo: 'Esfirras',
  descricao: 'Esfirras salgadas e doces vendidas por unidade: escolha os sabores, ajuste os ingredientes e some uma pizza ao pedido, se quiser.',
  caminho: '/esfirras'
})
</script>
