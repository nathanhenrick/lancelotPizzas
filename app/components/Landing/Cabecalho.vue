<template>
  <header ref="raiz" class="topo sticky-top border-bottom" @keydown.esc="fechar(true)">
    <nav class="navbar navbar-expand-lg py-2" aria-label="Principal">
      <div class="container">
        <AppLogo formato="horizontal" class="navbar-brand m-0 topo__logo" rotulo="Lancelot Pizzas, página inicial" />

        <div class="d-flex align-items-center gap-2 order-lg-last">
          <NuxtLink to="/loja" class="btn btn-primary btn-sm topo__botao fw-bold d-inline-flex align-items-center">Pedir<span class="d-none d-sm-inline">&nbsp;agora</span></NuxtLink>
          <ThemeToggle class="d-none d-lg-inline-flex" />
          <button
            type="button"
            class="navbar-toggler topo__botao"
            :aria-expanded="aberto"
            aria-controls="menu-landing"
            :aria-label="aberto ? 'Fechar menu' : 'Abrir menu'"
            @click="aberto ? fechar() : abrir()"
          >
            <span class="navbar-toggler-icon" />
          </button>
        </div>

        <div id="menu-landing" class="collapse navbar-collapse" :class="{ show: aberto }">
          <ul class="navbar-nav ms-lg-auto me-lg-4 fw-semibold">
            <li v-for="item in LINKS" :key="item.id" class="nav-item">
              <a class="nav-link py-3 py-lg-2" :href="`#${item.id}`" @click.prevent="irEFechar(item.id)">{{ item.rotulo }}</a>
            </li>
            <li class="nav-item">
              <NuxtLink class="nav-link py-3 py-lg-2" to="/sobre">Sobre a pizzaria</NuxtLink>
            </li>
          </ul>

          <div class="btn-group d-flex d-lg-none my-3" role="radiogroup" aria-label="Tema">
            <button
              v-for="opcao in OPCOES"
              :key="opcao"
              type="button"
              role="radio"
              class="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-1 topo__botao"
              :class="{ active: opcao === tema.atual.value }"
              :aria-checked="opcao === tema.atual.value"
              @click="tema.definir(opcao)"
            >
              <BaseIcon :nome="ICONE[opcao]" :tamanho="18" />
              {{ NOMES_TEMA[opcao] }}
            </button>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { NOMES_TEMA, type PreferenciaTema } from '~/composables/useTema'

const LINKS = [
  { id: 'montador', rotulo: 'Como pedir' }
]
const OPCOES: PreferenciaTema[] = ['light', 'dark', 'system']
const ICONE = { light: 'sol', dark: 'lua', system: 'auto' } as const

const tema = useTema()
const rolar = useRolarPara()
const raiz = ref<HTMLElement | null>(null)
const aberto = ref(false)

const abrir = () => { aberto.value = true }
const fechar = (voltarFoco = false) => {
  if (!aberto.value) return
  aberto.value = false
  if (voltarFoco) raiz.value?.querySelector<HTMLElement>('.navbar-toggler')?.focus()
}

const irEFechar = (id: string) => {
  fechar()
  rolar(id)
}

function aoClicarFora(e: Event) {
  if (aberto.value && raiz.value && !raiz.value.contains(e.target as Node)) fechar()
}
function aoRedimensionar() {
  if (window.innerWidth >= 992) aberto.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', aoClicarFora)
  window.addEventListener('resize', aoRedimensionar, { passive: true })
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', aoClicarFora)
  window.removeEventListener('resize', aoRedimensionar)
})
</script>

<style scoped>
.topo {
  padding-top: env(safe-area-inset-top);
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: blur(10px);
}

.topo__logo {
  height: 3.25rem;
}

.topo__botao {
  min-height: 2.75rem;
}

.navbar-toggler {
  min-width: 2.75rem;
}

.navbar-nav .nav-link {
  color: var(--fg);
}

@media (min-width: 992px) {
  .topo__logo {
    height: 4.25rem;
  }
}
</style>
