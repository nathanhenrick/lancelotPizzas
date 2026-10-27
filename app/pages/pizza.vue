<template>
  <Montador titulo="Monte sua pizza" />
</template>

<script setup lang="ts">
const pedido = usePedidoStore()
pedido.produto = 'pizza'

usePaginaSeo({
  titulo: 'Pizza',
  descricao: 'Monte sua pizza do seu jeito: escolha o tamanho, divida em até 4 sabores e veja a pizza tomar forma antes de pedir.',
  caminho: '/pizza'
})
</script>
