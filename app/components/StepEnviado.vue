<template>
  <div class="etapa">
    <svg class="etapa__ok" width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="22" cy="22" r="19" />
      <path d="M13 22.5l6 6 12-13" />
    </svg>
    <h2 id="titulo-etapa" class="titulo etapa__titulo" tabindex="-1">Pedido nº {{ pedido.numero }} pronto para enviar</h2>
    <p class="etapa__texto">
      {{ link ? 'Confira a mensagem e envie pelo WhatsApp para a pizzaria confirmar.' : 'Esta é a mensagem que será enviada. O WhatsApp da pizzaria ainda não foi configurado.' }}
    </p>
    <pre class="etapa__mensagem" v-html="mensagemFormatada" />
    <SegmentedControl v-model="pedido.modo" :opcoes="MODOS" legenda="Como você quer receber" nome="modo-enviado" />
    <BaseButton v-if="link" :href="link" externo variante="sucesso" bloco>
      <BaseIcon nome="enviar" :tamanho="18" /> Abrir o WhatsApp
      <span class="sr-only">(abre em nova aba)</span>
    </BaseButton>
    <BaseButton variante="contorno" bloco @click="novoPedido">Fazer outro pedido</BaseButton>
  </div>
</template>

<script setup lang="ts">
import type { ModoEntrega } from '~/types/pizza'

const pedido = usePedidoStore()

const MODOS: { valor: ModoEntrega, rotulo: string }[] = [
  { valor: 'entrega', rotulo: 'Entrega' },
  { valor: 'retirada', rotulo: 'Retirada no balcão' }
]

const inicio = '/loja'

function novoPedido() {
  pedido.reiniciar()
  void navigateTo(inicio)
}

useRestricaoEntrega(false)
const cardapio = useCardapioStore()

const whatsapp = useWhatsappDaLoja()

const mensagemFormatada = computed(() =>
  pedido.mensagem
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>')
    .replace(/(^|\s)_([^_\n]+)_/g, '$1<em>$2</em>')
)

const link = computed(() =>
  whatsapp.value ? `https://wa.me/${whatsapp.value.replace(/\D/g, '')}?text=${encodeURIComponent(pedido.mensagem)}` : ''
)
</script>

<style scoped>
.etapa {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.etapa__ok {
  color: var(--success);
}

.etapa__titulo {
  font-size: 1.75rem;
}

.etapa__texto {
  font-size: 0.875rem;
  color: var(--muted);
}

.etapa__mensagem {
  margin: 0;
  padding: 0.875rem 1rem;
  border-radius: 0.25rem 1rem 1rem 1rem;
  background: var(--bubble);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
