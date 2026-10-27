<template>
  <div class="previa">
    <ClientOnly>
      <PizzaCanvas :visual="visualSuave" :descricao="descricao" :interativa="false" :animar="false" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { ModeloBebida, PizzaVisual, Sabor } from '~/types/pizza'
import { MODELOS_BEBIDA } from '~/data/bebidas'

const props = defineProps<{ modelo: ModeloBebida | null, cor: number, nome: string, logo?: string | null }>()

const SABOR: Sabor = { id: 0, nome: 'Mussarela', tipo: 'salgada', faixa: 'trad', descricao: '', ingredientes: ['mussarela'], adicionais: [], ativo: true }

const visual = computed<PizzaVisual>(() => ({
  qtd: 1,
  partes: [SABOR],
  escala: 1,
  corRecheio: null,
  destaque: -1,
  bebidas: props.modelo ? [{ modelo: props.modelo, cor: props.cor, nome: props.nome, logo: props.logo }] : []
}))

const visualSuave = useVisualSuave(visual)

const descricao = computed(() =>
  props.modelo
    ? `Prévia: ${MODELOS_BEBIDA[props.modelo].nome.toLowerCase()} de ${props.nome || 'bebida'} ao lado de uma pizza grande.`
    : 'Prévia: esta bebida não aparece na cena.'
)
</script>

<style scoped>
.previa {
  height: 260px;
  border-radius: 0.5rem;
  background: var(--bs-tertiary-bg);
  display: grid;
}
</style>
