<template>
  <header ref="raiz" class="topo" @keydown.esc="fechar(true)">
    <div class="topo__miolo container">
      <AppLogo formato="horizontal" class="topo__logo" rotulo="Lancelot Pizzas, página inicial" />

      <nav class="topo__nav" aria-label="Seções da página">
        <a v-for="item in LINKS" :key="item.id" :href="`#${item.id}`" @click.prevent="ir(item.id)">{{ item.rotulo }}</a>
        <NuxtLink to="/sobre">Sobre a pizzaria</NuxtLink>
      </nav>

      <div class="topo__acoes">
        <NuxtLink to="/loja" class="topo__cta">Pedir<span class="topo__cta-extra">&nbsp;agora</span></NuxtLink>
        <ThemeToggle class="topo__tema" />
        <button
          type="button"
          class="topo__menu"
          :aria-expanded="aberto"
          aria-controls="menu-landing"
          :aria-label="aberto ? 'Fechar menu' : 'Abrir menu'"
          @click="aberto ? fechar() : abrir()"
        >
          <span class="burger" :class="{ 'burger--aberto': aberto }" aria-hidden="true"><i /><i /><i /></span>
        </button>
      </div>
    </div>

    <Transition name="menu">
      <div v-if="aberto" id="menu-landing" class="painel">
        <nav aria-label="Menu">
          <a v-for="item in LINKS" :key="item.id" :href="`#${item.id}`" class="painel__link" @click.prevent="irEFechar(item.id)">{{ item.rotulo }}</a>
          <NuxtLink to="/sobre" class="painel__link">Sobre a pizzaria</NuxtLink>
        </nav>

        <div class="painel__tema" role="radiogroup" aria-label="Tema">
          <button
            v-for="opcao in OPCOES"
            :key="opcao"
            type="button"
            role="radio"
            class="painel__opcao"
            :class="{ 'painel__opcao--ativa': opcao === tema.atual.value }"
            :aria-checked="opcao === tema.atual.value"
            @click="tema.definir(opcao)"
          >
            <BaseIcon :nome="ICONE[opcao]" :tamanho="18" />
            {{ NOMES_TEMA[opcao] }}
          </button>
        </div>

      </div>
    </Transition>
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
  if (voltarFoco) raiz.value?.querySelector<HTMLElement>('.topo__menu')?.focus()
}

const ir = (id: string) => rolar(id)
const irEFechar = (id: string) => {
  fechar()
  rolar(id)
}

function aoClicarFora(e: Event) {
  if (aberto.value && raiz.value && !raiz.value.contains(e.target as Node)) fechar()
}
function aoRedimensionar() {
  if (window.innerWidth >= 960) aberto.value = false
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
  position: sticky;
  top: 0;
  z-index: 20;
  padding-top: env(safe-area-inset-top);
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: blur(10px);
}

.topo__miolo {
  padding-block: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.topo__logo {
  height: 3.25rem;
}

.topo__nav {
  display: none;
  gap: 1.75rem;
  margin-left: auto;
  font-weight: 600;
  font-size: 0.9375rem;
}

.topo__nav a {
  color: var(--fg);
  text-decoration: none;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.topo__nav a:hover {
  border-bottom-color: var(--primary);
}

.topo__acoes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.topo__cta {
  min-height: 2.75rem;
  padding: 0 1rem;
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius);
  background: var(--primary);
  color: var(--primary-fg);
  font-weight: 700;
  font-size: 0.875rem;
  text-decoration: none;
  white-space: nowrap;
}

.topo__cta:hover {
  filter: brightness(1.08);
}

.topo__tema {
  display: none;
}

.topo__cta-extra {
  display: none;
}

@media (min-width: 440px) {
  .topo__cta-extra {
    display: inline;
  }
}

.topo__menu {
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

.burger {
  position: relative;
  width: 1.25rem;
  height: 0.875rem;
}

.burger i {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
  transition: transform 0.25s ease, opacity 0.2s ease, top 0.25s ease;
}

.burger i:nth-child(1) { top: 0; }
.burger i:nth-child(2) { top: calc(50% - 1px); }
.burger i:nth-child(3) { top: calc(100% - 2px); }

.burger--aberto i:nth-child(1) { top: calc(50% - 1px); transform: rotate(45deg); }
.burger--aberto i:nth-child(2) { opacity: 0; }
.burger--aberto i:nth-child(3) { top: calc(50% - 1px); transform: rotate(-45deg); }

.painel {
  border-top: 1px solid var(--border);
  padding: 0.75rem 1rem 1.25rem;
  background: var(--bg);
  display: grid;
  gap: 1rem;
  max-height: calc(100dvh - 4rem);
  overflow-y: auto;
}

.painel nav {
  display: grid;
}

.painel__link {
  padding: 0.875rem 0.25rem;
  border-bottom: 1px solid var(--border);
  color: var(--fg);
  font-weight: 600;
  text-decoration: none;
}

.painel__tema {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: var(--radius);
  background: var(--surface-2);
}

.painel__opcao {
  min-height: 2.75rem;
  padding: 0 0.5rem;
  border: 0;
  border-radius: calc(var(--radius) - 0.25rem);
  background: transparent;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.painel__opcao--ativa {
  background: var(--surface);
  color: var(--fg);
  box-shadow: 0 1px 3px rgba(60, 35, 15, 0.2);
}


.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

@media (min-width: 960px) {
  .topo__miolo {
    gap: 1.5rem;
  }


  .topo__logo {
    height: 4.25rem;
  }

  .topo__nav {
    display: flex;
  }

  .topo__acoes {
    margin-left: 0;
  }

  .topo__tema {
    display: inline-flex;
  }

  .topo__menu,
  .painel {
    display: none;
  }
}
</style>
