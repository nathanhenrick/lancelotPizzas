<template>
  <div class="escolha">
    <h2 id="titulo-etapa" class="titulo escolha__titulo" tabindex="-1">O que você quer pedir?</h2>
    <ul class="escolha__lista">
      <li v-for="op in OPCOES" :key="op.valor">
        <NuxtLink :to="op.para" class="escolha__op">
          <span class="escolha__imagem">
            <ClientOnly>
              <span class="escolha__3d" aria-hidden="true">
                <PizzaCanvas :visual="op.valor === 'pizza' ? visualPizza : visualEsfirra" :descricao="op.nome" :interativa="false" :animar="false" />
              </span>
              <template #fallback>
                <img :src="op.imagem" alt="" width="200" height="200" decoding="async">
              </template>
            </ClientOnly>
          </span>
          <span class="escolha__nome titulo">{{ op.nome }}</span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { PizzaVisual, Sabor } from '~/types/pizza'

const cardapio = useCardapioStore()

const SABOR_PADRAO: Sabor = { id: 0, nome: 'Marguerita', tipo: 'salgada', faixa: 'trad', descricao: '', ingredientes: ['tomate', 'manjericao'], adicionais: [], ativo: true }
const COR_ESFIRRA_PADRAO = 0x8c3b22

const visualPizza = computed<PizzaVisual>(() => ({
  qtd: 1,
  partes: [cardapio.saboresAtivos.find((x) => x.tipo === 'salgada') ?? SABOR_PADRAO],
  escala: 1,
  corRecheio: null,
  destaque: -1
}))

const visualEsfirra = computed<PizzaVisual>(() => ({
  qtd: 1,
  partes: [null],
  escala: 1,
  corRecheio: null,
  destaque: -1,
  modo: 'esfirra',
  esfirras: [{ id: 0, cor: cardapio.esfirrasAtivas[0]?.cor ?? COR_ESFIRRA_PADRAO, quantidade: 1 }]
}))

const OPCOES = [
  { valor: 'pizza', para: '/pizza', nome: 'Pizza', imagem: '/img/pizza.svg' },
  { valor: 'esfirra', para: '/esfirras', nome: 'Esfirras', imagem: '/img/esfirra.svg' }
]
</script>

<style scoped>
.escolha {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
}

.escolha__titulo {
  font-size: 1.375rem;
  text-align: center;
}

.escolha__titulo:focus-visible {
  outline-offset: 4px;
}

.escolha__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.escolha__op {
  width: 100%;
  padding: 0.75rem 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border);
  background: var(--surface);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.escolha__op:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.escolha__imagem {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius);
  background: var(--surface-2);
  display: grid;
  place-items: center;
}

.escolha__3d {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.escolha__imagem img {
  width: 82%;
  height: auto;
}

.escolha__nome {
  font-size: 1.125rem;
}
</style>
