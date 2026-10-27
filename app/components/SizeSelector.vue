<template>
  <SegmentedControl
    :model-value="pedido.tamanho"
    :opcoes="opcoes"
    legenda="Tamanho da pizza"
    nome="tamanho"
    @update:model-value="trocar"
  />
</template>

<script setup lang="ts">
import type { TamanhoId } from '~/types/pizza'
const pedido = usePedidoStore()
const cardapio = useCardapioStore()
const { anunciar } = useAnuncio()

const opcoes = computed(() => cardapio.tamanhos.map((t) => ({ valor: t.id, rotulo: t.nome, detalhe: t.info })))

function trocar(id: TamanhoId) {
  const antes = pedido.qtdSabores
  pedido.definirTamanho(id)
  const t = pedido.tamanhoAtual
  anunciar(antes !== pedido.qtdSabores
    ? `Tamanho ${t.nome}. Este tamanho aceita até ${t.max_sabores} sabores, a pizza agora tem ${pedido.qtdSabores}.`
    : `Tamanho ${t.nome}.`)
}
</script>
