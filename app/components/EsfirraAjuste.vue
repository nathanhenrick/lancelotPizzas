<template>
  <section class="seletor" role="dialog" aria-labelledby="esfirra-ajuste-titulo" @keydown.esc.stop="fechar">
    <header class="seletor__topo">
      <div class="seletor__cabecalho">
        <h2 id="esfirra-ajuste-titulo" ref="titulo" class="titulo seletor__titulo" tabindex="-1">Personalizar esfirra</h2>
        <p class="seletor__sub">{{ dados.quantidade }}× {{ nomeComTamanho(dados) }} · {{ dados.quantidade === 1 ? 'vale para esta unidade' : `vale para as ${dados.quantidade} unidades` }}</p>
      </div>
      <button type="button" class="seletor__icone" aria-label="Fechar sem alterar" @click="fechar">
        <BaseIcon nome="fechar" />
      </button>
    </header>
    <AjusteItem
      :nome="dados.esfirra.nome"
      :ingredientes="ingredientes"
      :adicionais="adicionaisDaEsfirra"
      :inicial="inicial"
      :unidades="dados.quantidade"
      rotulo-confirmar="Confirmar esfirra"
      rotulo-observacao="Observação desta esfirra"
      @confirmar="confirmar"
    />
  </section>
</template>

<script setup lang="ts">
import type { AjusteParte } from '~/types/pizza'

const pedido = usePedidoStore()
const cardapio = useCardapioStore()
const { anunciar } = useAnuncio()

const chave = pedido.esfirraAjustando!
const dados = computed(() => pedido.esfirrasPedidas.find((p) => chaveEsfirra(p.esfirra.id, p.tamanho) === chave)!)

const ingredientes = computed(() => ingredientesDaEsfirra(dados.value.esfirra))
const adicionaisDaEsfirra = computed(() => cardapio.adicionaisAtivos.filter((a) => dados.value.esfirra.adicionais?.includes(a.id)))
const inicial = pedido.ajustesEsfirra[chave] ?? ajusteVazio()

const titulo = ref<HTMLElement>()
let focoAnterior: HTMLElement | null = null

onMounted(() => {
  focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null
  titulo.value?.focus()
})

onBeforeUnmount(() => {
  if (focoAnterior?.isConnected) focoAnterior.focus()
})

const fechar = () => pedido.fecharAjusteEsfirra()

function confirmar(ajuste: AjusteParte) {
  pedido.confirmarAjusteEsfirra(chave, ajuste)
  anunciar(`${dados.value.esfirra.nome} atualizada.`)
}
</script>

<style scoped>
.seletor {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  background: var(--surface-2);
  border-radius: 1.375rem 1.375rem 0 0;
  box-shadow: var(--shadow);
}

.seletor__topo {
  flex: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 0.5rem 0.5rem 1.125rem;
}

.seletor__cabecalho {
  flex: 1;
  min-width: 0;
}

.seletor__titulo {
  font-size: 1.125rem;
}

.seletor__titulo:focus-visible {
  outline-offset: 4px;
}

.seletor__sub {
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  color: var(--muted);
}

.seletor__icone {
  flex: none;
  width: 2.75rem;
  height: 2.75rem;
  border: 0;
  border-radius: var(--radius);
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 900px) {
  .seletor {
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
