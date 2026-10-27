<template>
  <div class="previa">
    <ClientOnly>
      <PizzaCanvas :visual="visualSuave" :descricao="descricao" :interativa="false" :animar="false" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { PizzaVisual, Sabor } from '~/types/pizza'

const props = defineProps<{ cor: number | null, nome: string }>()

const SABOR: Sabor = { id: 0, nome: 'Mussarela', tipo: 'salgada', faixa: 'trad', descricao: '', ingredientes: ['mussarela'], adicionais: [], ativo: true }

const visual = computed<PizzaVisual>(() => ({ qtd: 1, partes: [SABOR], escala: 1, corRecheio: props.cor, destaque: -1 }))

const visualSuave = useVisualSuave(visual)

const descricao = computed(() =>
  props.cor === null
    ? `Prévia da pizza com a borda ${props.nome || 'tradicional'}, sem recheio.`
    : `Prévia da pizza com a borda ${props.nome || 'recheada'}, com recheio aparente.`
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
