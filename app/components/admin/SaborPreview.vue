<template>
  <div class="previa">
    <ClientOnly>
      <PizzaCanvas :visual="visualSuave" :descricao="descricao" :interativa="false" :animar="false" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { PizzaVisual, Sabor } from '~/types/pizza'
import { INGREDIENTES } from '~/data/ingredientes'

const props = defineProps<{ ingredientes: string[], nome: string }>()

const visual = computed<PizzaVisual>(() => {
  const sabor: Sabor = { id: 0, nome: props.nome, tipo: 'salgada', faixa: 'trad', descricao: '', ingredientes: [...props.ingredientes], adicionais: [], ativo: true }
  return { qtd: 1, partes: [sabor], escala: 1, corRecheio: null, destaque: -1 }
})

const visualSuave = useVisualSuave(visual)

const descricao = computed(() => {
  const nomes = props.ingredientes.map((id) => INGREDIENTES[id]?.nome ?? id)
  return nomes.length ? `Prévia da pizza com ${nomes.join(', ')}.` : 'Prévia da pizza só com queijo.'
})
</script>

<style scoped>
.previa {
  height: 240px;
  border-radius: 0.5rem;
  background: var(--bs-tertiary-bg);
}
</style>
