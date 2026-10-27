<template>
  <Montador titulo="Peça pizza ou esfirras" />
</template>

<script setup lang="ts">
usePaginaSeo({
  titulo: 'Peça pizza ou esfirras',
  descricao: 'Peça pizza ou esfirras online: escolha o produto, monte do seu jeito e envie o pedido pelo WhatsApp.',
  caminho: '/loja'
})

await abrirEscolhaDeProduto()
</script>
