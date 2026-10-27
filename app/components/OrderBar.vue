<template>
  <footer class="barra">
    <div class="barra__valores">
      <p class="barra__total titulo">
        <span class="sr-only">Total: </span>{{ formatarPreco(pedido.total) }}
      </p>
      <p id="barra-nota" class="barra__nota">{{ nota }}</p>
    </div>
    <BaseButton :disabled="!pedido.podeAvancar" aria-describedby="barra-nota" @click="avancar">
      {{ proxima === 'extras' ? 'Bebidas' : 'Ver pedido' }} <BaseIcon nome="avancar" :tamanho="18" />
    </BaseButton>
  </footer>
</template>

<script setup lang="ts">
const pedido = usePedidoStore()
const cardapio = useCardapioStore()

const nota = computed(() => {
  if (!pedido.temPizza) return pedido.qtdEsfirras ? 'Só esfirras, sem pizza' : 'Escolha uma pizza ou esfirras'
  if (!pedido.completa) {
    const faltam = pedido.qtdSabores - pedido.preenchidas
    return faltam === 1 ? 'Falta escolher 1 sabor' : `Falta escolher ${faltam} sabores`
  }
  if (pedido.qtdSabores === 1) return `Pizza ${pedido.tamanhoAtual.nome}`
  return cardapio.config.regra_preco === 'media' ? 'Preço pela média dos sabores' : 'Vale o sabor de maior valor'
})

const proxima = computed(() => (pedido.etapa === 'montar' && cardapio.bebidasAtivas.length ? 'extras' : 'pedido'))
const avancar = () => pedido.irPara(proxima.value)
</script>

<style scoped>
.barra {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 1rem;
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
  border-top: 1px solid var(--border);
  background: var(--bg);
}

.barra__valores {
  flex: 1;
}

.barra__total {
  font-size: 1.5rem;
}

.barra__nota {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--muted);
}
</style>
