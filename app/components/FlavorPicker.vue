<template>
  <section
    class="seletor"
    role="dialog"
    aria-labelledby="seletor-titulo"
    aria-describedby="seletor-sub"
    @keydown.esc.stop="voltarOuFechar"
  >
    <header class="seletor__topo">
      <button v-if="escolhido" type="button" class="seletor__icone" aria-label="Voltar para a lista de sabores" @click="trocar">
        <BaseIcon nome="voltar" />
      </button>
      <div class="seletor__cabecalho">
        <h2 id="seletor-titulo" ref="titulo" class="titulo seletor__titulo" tabindex="-1">{{ tituloTexto }}</h2>
        <p id="seletor-sub" class="seletor__sub">{{ subTexto }}</p>
      </div>
      <button type="button" class="seletor__icone" aria-label="Fechar a escolha de sabor" @click="fechar">
        <BaseIcon nome="fechar" />
      </button>
    </header>

    <template v-if="!escolhido">
      <div v-if="temDoces && temSalgadas" class="seletor__abas" role="tablist" aria-label="Tipo de pizza">
        <button
          v-for="aba in ABAS"
          :id="`aba-${aba.valor}`"
          :key="aba.valor"
          type="button"
          role="tab"
          class="seletor__aba"
          :class="{ 'seletor__aba--ativa': tipo === aba.valor }"
          :aria-selected="tipo === aba.valor"
          aria-controls="seletor-lista"
          @click="tipo = aba.valor"
        >
          {{ aba.rotulo }}
        </button>
      </div>
      <ul id="seletor-lista" class="seletor__lista" :aria-labelledby="temDoces && temSalgadas ? `aba-${tipo}` : undefined">
        <li v-for="sabor in listados" :key="sabor.id">
          <FlavorOption
            :sabor="sabor"
            :preco="cardapio.faixas[sabor.faixa][pedido.tamanho]"
            :faixa="cardapio.faixas[sabor.faixa].nome"
            :selecionado="pedido.partes[pedido.parteAtiva] === sabor.id"
            @click="abrirSabor(sabor)"
          />
        </li>
        <li v-if="!listados.length" class="seletor__vazio">Nenhum sabor {{ tipo === 'doce' ? 'doce' : 'salgado' }} no cardápio.</li>
      </ul>
    </template>

    <AjusteItem
      v-else
      :nome="escolhido.nome"
      :ingredientes="ingredientes"
      :adicionais="adicionaisDoSabor"
      :inicial="ajusteInicial"
      rotulo-confirmar="Confirmar sabor"
      rotulo-observacao="Observação deste sabor"
      pode-trocar
      @trocar="trocar"
      @confirmar="confirmar"
    />
  </section>
</template>

<script setup lang="ts">
import type { AjusteParte, Sabor, TipoSabor } from '~/types/pizza'

const pedido = usePedidoStore()
const cardapio = useCardapioStore()
const { anunciar } = useAnuncio()

const ABAS: { valor: TipoSabor, rotulo: string }[] = [
  { valor: 'salgada', rotulo: 'Salgadas' },
  { valor: 'doce', rotulo: 'Doces' }
]

const titulo = ref<HTMLElement>()
let focoAnterior: HTMLElement | null = null

const temDoces = computed(() => cardapio.saboresAtivos.some((s) => s.tipo === 'doce'))
const temSalgadas = computed(() => cardapio.saboresAtivos.some((s) => s.tipo !== 'doce'))

const tipo = ref<TipoSabor>(pedido.saboresDasPartes[pedido.parteAtiva]?.tipo ?? 'salgada')
const listados = computed(() =>
  cardapio.saboresAtivos.filter((s) => !(temDoces.value && temSalgadas.value) || (s.tipo === 'doce') === (tipo.value === 'doce'))
)

const escolhido = ref<Sabor | null>(null)
const ajusteInicial = ref<AjusteParte>(ajusteVazio())
const ingredientes = computed(() => (escolhido.value ? ingredientesDoSabor(escolhido.value) : []))
const adicionaisDoSabor = computed(() =>
  cardapio.adicionaisAtivos.filter((a) => escolhido.value?.adicionais?.includes(a.id))
)

const tituloTexto = computed(() => {
  if (escolhido.value) return 'Personalizar sabor'
  return pedido.qtdSabores === 1 ? 'Escolha o sabor' : `Sabor da parte ${pedido.parteAtiva + 1} de ${pedido.qtdSabores}`
})
const subTexto = computed(() =>
  escolhido.value
    ? 'Tire ingredientes, some extras ou deixe uma observação'
    : `${pedido.qtdSabores === 1 ? 'Pizza inteira' : `${pedido.fracao} da pizza`} · preços para ${pedido.tamanhoAtual.nome}`
)

onMounted(() => {
  focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null
  titulo.value?.focus()
})

onBeforeUnmount(() => {
  if (focoAnterior?.isConnected) focoAnterior.focus()
})

function fechar() {
  pedido.fecharSeletor()
}

function voltarOuFechar() {
  if (escolhido.value) trocar()
  else fechar()
}

function abrirSabor(sabor: Sabor) {
  const atual = pedido.partes[pedido.parteAtiva] === sabor.id ? pedido.ajustes[pedido.parteAtiva] : undefined
  ajusteInicial.value = atual ? { removidos: [...atual.removidos], adicionais: [...atual.adicionais], observacao: atual.observacao } : ajusteVazio()
  escolhido.value = sabor
  nextTick(() => titulo.value?.focus())
}

function trocar() {
  escolhido.value = null
  nextTick(() => titulo.value?.focus())
}

function confirmar(ajuste: AjusteParte) {
  const sabor = escolhido.value
  if (!sabor) return
  const parte = pedido.parteAtiva
  pedido.escolherSabor(sabor.id, ajuste)
  const onde = pedido.qtdSabores === 1 ? 'na pizza inteira' : `na parte ${parte + 1}`
  anunciar(pedido.completa
    ? `${sabor.nome} ${onde}. Pizza completa, total ${formatarPreco(pedido.total)}.`
    : `${sabor.nome} ${onde}. Toque em outra parte para escolher o sabor dela.`)
  fechar()
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

.seletor__abas {
  flex: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  margin: 0 0.75rem 0.5rem;
  padding: 0.25rem;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1.5px solid var(--border);
}

.seletor__aba {
  min-height: 2.5rem;
  border: 0;
  border-radius: calc(var(--radius) - 0.25rem);
  background: transparent;
  font-weight: 600;
  color: var(--muted);
}

.seletor__aba--ativa {
  background: var(--primary);
  color: var(--primary-fg);
}

.seletor__lista {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0.25rem 0.75rem calc(1rem + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.seletor__vazio {
  padding: 1rem;
  text-align: center;
  color: var(--muted);
}

@media (min-width: 900px) {
  .seletor {
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
