<template>
  <form class="etapa" novalidate @submit.prevent="enviar">
    <BaseButton variante="texto" class="etapa__voltar" @click="pedido.irPara(cardapio.bebidasAtivas.length ? 'extras' : 'montar')">
      <BaseIcon nome="voltar" :tamanho="18" /> Voltar
    </BaseButton>
    <h2 id="titulo-etapa" class="titulo etapa__titulo" tabindex="-1">Seu pedido</h2>
    <OrderSummary />
    <div id="pedido-modo" class="campo">
      <span class="campo__rotulo">Como você quer receber <span class="obrigatorio" aria-hidden="true">*</span></span>
      <SegmentedControl v-model="pedido.modo" :opcoes="MODOS" legenda="Como você quer receber (obrigatório)" nome="modo" />
    </div>
    <div class="campo">
      <label for="pedido-nome" class="campo__rotulo">Seu nome <span class="obrigatorio" aria-hidden="true">*</span></label>
      <input id="pedido-nome" ref="campoNome" v-model="pedido.nome" class="campo__input" :class="{ 'campo__input--erro': semNome }" type="text" autocomplete="name" aria-required="true" :aria-invalid="semNome">
    </div>
    <p class="etapa__nota">
      O telefone não é pedido aqui: a pizzaria recebe o seu número junto com a mensagem do WhatsApp.
    </p>
    <BaseButton type="submit" variante="sucesso" bloco :disabled="pedido.enviando" :aria-busy="pedido.enviando">
      <Loader v-if="pedido.enviando" linha :tamanho="22" texto="Enviando pedido…" />
      <BaseIcon v-else nome="enviar" :tamanho="18" /> {{ pedido.enviando ? 'Enviando pedido…' : 'Enviar pedido pelo WhatsApp' }}
    </BaseButton>
  </form>
</template>

<script setup lang="ts">
import type { ModoEntrega } from '~/types/pizza'

const MODOS: { valor: ModoEntrega, rotulo: string }[] = [
  { valor: 'entrega', rotulo: 'Entrega' },
  { valor: 'retirada', rotulo: 'Retirada no balcão' }
]

const pedido = usePedidoStore()
const cardapio = useCardapioStore()
const alerta = useAlerta()
const { verificar } = useRestricaoEntrega()

const campoNome = ref<HTMLInputElement>()
const tentouEnviar = ref(false)
const semNome = computed(() => tentouEnviar.value && !pedido.nome.trim())

async function enviar() {
  tentouEnviar.value = true
  const erros = {
    modo: pedido.modo ? '' : 'Escolha entre entrega e retirada no balcão.',
    nome: semNome.value ? 'Informe o seu nome para enviar o pedido.' : ''
  }
  if (!alerta.validar(erros)) {
    if (erros.modo) document.getElementById('pedido-modo')?.scrollIntoView({ block: 'center' })
    else campoNome.value?.focus()
    return
  }
  if (!(await verificar())) return
  await pedido.enviar()
  if (pedido.erroEnvio) alerta.erro(pedido.erroEnvio)
}
</script>

<style scoped>
.etapa {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.etapa__voltar {
  align-self: flex-start;
}

.etapa__titulo {
  font-size: 1.75rem;
}

.etapa__nota {
  font-size: 0.8125rem;
  color: var(--muted);
}

.campo__input.campo__input--erro {
  border-color: tomato;
  border-width: 2px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.campo__rotulo {
  font-size: 0.875rem;
  color: var(--muted);
}

.campo__input {
  height: 3rem;
  padding: 0 0.875rem;
  border-radius: var(--radius);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
}
</style>
