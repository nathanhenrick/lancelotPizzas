<template>
  <div class="etapa">
    <h2 id="titulo-etapa" class="sr-only" tabindex="-1">Pizza ou esfirras</h2>
    <SegmentedControl v-if="cardapio.esfirrasAtivas.length" v-model="produtoNaRota" :opcoes="PRODUTOS" legenda="O que você quer pedir" nome="produto" />
    <template v-if="pedido.produtoAtual === 'pizza'">
      <SizeSelector />
      <FlavorCountSelector />
      <PartList />
      <CrustSelector />
    </template>
    <template v-else>
      <p class="etapa__dica">Esfirras vendidas por unidade. Você pode pedir só esfirras ou somar com uma pizza.</p>
      <SegmentedControl v-if="temDoces && temSalgadas" v-model="tipoEsfirra" :opcoes="TIPOS" legenda="Tipo de esfirra" nome="tipo-esfirra" />
      <ProdutoLista
        id-base="esfirras"
        :titulo="tipoEsfirra === 'doce' ? 'Esfirras doces' : 'Esfirras'"
        :itens="itensEsfirra"
        :quantidades="pedido.esfirras"
        :max="50"
        @alterar="pedido.definirEsfirra"
        @personalizar="pedido.abrirAjusteEsfirra"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
const pedido = usePedidoStore()
const cardapio = useCardapioStore()

const produtoNaRota = computed({
  get: () => pedido.produtoAtual,
  set: (valor) => { void navigateTo(valor === 'esfirra' ? '/esfirras' : '/pizza') }
})

const TIPOS = [
  { valor: 'salgada' as const, rotulo: 'Salgadas' },
  { valor: 'doce' as const, rotulo: 'Doces' }
]
const temDoces = computed(() => cardapio.esfirrasAtivas.some((e) => e.tipo === 'doce'))
const temSalgadas = computed(() => cardapio.esfirrasAtivas.some((e) => e.tipo !== 'doce'))
const tipoEsfirra = ref<'salgada' | 'doce'>('salgada')
const exibidas = computed(() =>
  cardapio.esfirrasAtivas.filter((e) => !(temDoces.value && temSalgadas.value) || (e.tipo === 'doce') === (tipoEsfirra.value === 'doce'))
)

const itensEsfirra = computed(() =>
  exibidas.value.flatMap((e) => {
    const tamanhos = tamanhosDaEsfirra(e)
    return tamanhos.map((t) => ({
      id: chaveEsfirra(e.id, t.nome),
      nome: tamanhos.length > 1 ? `${e.nome} · ${t.nome}` : e.nome,
      descricao: e.descricao,
      preco: t.preco,
      personalizavel: e.tipo !== 'doce' && (e.ingredientes?.length > 0 || e.adicionais?.length > 0),
      alterado: temAjuste(pedido.ajustesEsfirra[chaveEsfirra(e.id, t.nome)])
    }))
  })
)

const PRODUTOS = [
  { valor: 'pizza' as const, rotulo: 'Pizza' },
  { valor: 'esfirra' as const, rotulo: 'Esfirras' }
]
</script>

<style scoped>
.etapa {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.etapa__dica {
  font-size: 0.8125rem;
  color: var(--muted);
}
</style>
