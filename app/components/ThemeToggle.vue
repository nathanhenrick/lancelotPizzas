<template>
  <div ref="raiz" class="tema" @keydown.esc="fechar(true)" @focusout="aoSairFoco">
    <button
      ref="botao"
      type="button"
      class="tema__botao"
      :aria-label="`Tema: ${NOMES_TEMA[atual]}`"
      :title="`Tema: ${NOMES_TEMA[atual]}`"
      aria-haspopup="menu"
      :aria-expanded="aberto"
      @click="aberto ? fechar() : abrir()"
    >
      <BaseIcon :nome="ICONE[atual]" />
    </button>

    <Transition name="menu">
      <ul v-if="aberto" class="tema__menu" role="menu" aria-label="Tema" @keydown.down.prevent="mover(1)" @keydown.up.prevent="mover(-1)">
        <li v-for="opcao in OPCOES" :key="opcao" role="none">
          <button
            type="button"
            class="tema__opcao"
            :class="{ 'tema__opcao--ativa': opcao === atual }"
            role="menuitemradio"
            :aria-checked="opcao === atual"
            @click="escolher(opcao)"
          >
            <BaseIcon :nome="ICONE[opcao]" :tamanho="18" />
            <span class="tema__nome">{{ NOMES_TEMA[opcao] }}</span>
            <BaseIcon v-if="opcao === atual" nome="check" :tamanho="16" class="tema__check" />
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { PreferenciaTema } from '~/composables/useTema'

const OPCOES: PreferenciaTema[] = ['system', 'light', 'dark']
const ICONE = { system: 'auto', light: 'sol', dark: 'lua' } as const satisfies Record<PreferenciaTema, string>

const { atual, definir } = useTema()

const raiz = ref<HTMLElement>()
const botao = ref<HTMLButtonElement>()
const aberto = ref(false)

const opcoes = () => [...(raiz.value?.querySelectorAll<HTMLButtonElement>('.tema__opcao') ?? [])]

async function abrir() {
  aberto.value = true
  await nextTick()
  opcoes()[OPCOES.indexOf(atual.value)]?.focus()
}

function fechar(voltarFoco = false) {
  aberto.value = false
  if (voltarFoco) botao.value?.focus()
}

function escolher(opcao: PreferenciaTema) {
  definir(opcao)
  fechar(true)
}

function mover(passo: number) {
  const lista = opcoes()
  const i = lista.indexOf(document.activeElement as HTMLButtonElement)
  lista[(i + passo + lista.length) % lista.length]?.focus()
}

function aoSairFoco(e: FocusEvent) {
  if (!raiz.value?.contains(e.relatedTarget as Node | null)) fechar()
}

function cliqueFora(e: PointerEvent) {
  if (aberto.value && !raiz.value?.contains(e.target as Node)) fechar()
}
onMounted(() => document.addEventListener('pointerdown', cliqueFora))
onBeforeUnmount(() => document.removeEventListener('pointerdown', cliqueFora))
</script>

<style scoped>
.tema {
  position: relative;
}

.tema__botao {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  color: var(--fg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tema__menu {
  position: absolute;
  top: calc(100% + 0.375rem);
  right: 0;
  z-index: 20;
  min-width: 11rem;
  margin: 0;
  padding: 0.375rem;
  list-style: none;
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  background: var(--surface);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
}

.tema__opcao {
  width: 100%;
  min-height: 2.75rem;
  padding: 0 0.75rem;
  border: 0;
  border-radius: calc(var(--radius) - 0.25rem);
  background: transparent;
  color: var(--fg);
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-align: left;
}

.tema__opcao:hover,
.tema__opcao:focus-visible {
  background: var(--surface-2);
}

.tema__opcao--ativa {
  font-weight: 600;
}

.tema__nome {
  flex: 1;
}

.tema__check {
  color: var(--primary);
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .menu-enter-active,
  .menu-leave-active {
    transition: none;
  }
}
</style>
