<template>
  <main id="conteudo" class="montador" :class="{ 'montador--solo': semPalco }" tabindex="-1">
    <h1 class="sr-only">{{ titulo }}</h1>

    <section v-if="!semPalco" class="montador__palco" aria-label="Sua pizza">
      <PizzaStage />
    </section>

    <section class="montador__painel" aria-label="Opções do pedido">
      <div class="montador__rolagem" :inert="pedido.seletorAberto || Boolean(pedido.esfirraAjustando)">
        <div v-if="cardapio.erro" class="montador__aviso" role="alert">
          <p>Não conseguimos carregar o cardápio agora.</p>
          <BaseButton variante="contorno" @click="cardapio.carregar()">Tentar de novo</BaseButton>
        </div>
        <EscolhaProduto v-if="precisaEscolher" />
        <StepMontar v-else-if="pedido.etapa === 'montar'" />
        <StepExtras v-else-if="pedido.etapa === 'extras'" />
        <StepPedido v-else-if="pedido.etapa === 'pedido'" />
        <StepEnviado v-else />
      </div>
      <OrderBar v-if="comBarra" :inert="pedido.seletorAberto || Boolean(pedido.esfirraAjustando)" />
      <Transition name="subir">
        <FlavorPicker v-if="pedido.seletorAberto" />
      </Transition>
      <Transition name="subir">
        <EsfirraAjuste v-if="pedido.esfirraAjustando" />
      </Transition>
    </section>
  </main>
</template>

<script setup lang="ts">
defineProps<{ titulo: string }>()

const pedido = usePedidoStore()
const cardapio = useCardapioStore()

const precisaEscolher = computed(() => pedido.etapa === 'montar' && pedido.produtoAtual === null)
const semPalco = computed(() => precisaEscolher.value)
const comBarra = computed(() => !precisaEscolher.value && (pedido.etapa === 'montar' || pedido.etapa === 'extras'))

watch(() => pedido.etapa, async () => {
  await nextTick()
  document.getElementById('titulo-etapa')?.focus()
})
</script>

<style scoped>
.montador {
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(190px, 40dvh) minmax(0, 1fr);
}

.montador:focus {
  outline: none;
}

.montador__palco {
  min-height: 0;
}

.montador__painel {
  position: relative;
  min-height: 0;
  overflow: clip;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
}

.montador__rolagem {
  overflow-y: auto;
  padding: 0.5rem 1rem 1rem;
}

.montador__aviso {
  margin-bottom: 1rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius);
  border: 1.5px solid var(--primary);
  background: var(--surface);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-weight: 600;
  color: var(--accent-text);
}

.montador--solo {
  grid-template-rows: minmax(0, 1fr);
}

.montador--solo .montador__painel {
  width: 100%;
  max-width: 36rem;
  margin: 0 auto;
}

.montador--solo .montador__rolagem {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 3rem;
}

@media (min-width: 900px), (orientation: landscape) and (min-width: 600px) and (max-height: 560px) {
  .montador {
    grid-template-rows: minmax(0, 1fr);
    grid-template-columns: minmax(0, 1fr) minmax(20rem, 27.5rem);
  }

  .montador__painel {
    border-left: 1px solid var(--border);
  }

  .montador.montador--solo {
    grid-template-columns: minmax(0, 1fr);
  }

  .montador--solo .montador__painel {
    border-left: 0;
  }

  .montador__rolagem {
    padding: 1.25rem 1.25rem 1.5rem;
  }
}

@media (min-width: 1400px) {
  .montador {
    grid-template-columns: minmax(0, 1fr) 30rem;
  }
}

.subir-enter-active,
.subir-leave-active {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}

.subir-enter-from,
.subir-leave-to {
  transform: translateY(24px);
  opacity: 0;
}
</style>
