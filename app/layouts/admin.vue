<template>
  <div class="admin-shell">
    <a href="#admin-conteudo" class="visually-hidden-focusable admin-pular">Pular para o conteúdo</a>

    <div v-if="state.isMobileOpen" class="sidebar-overlay" @click="closeMobileSidebar" />

    <div class="mobile-topbar d-flex d-xl-none align-items-center justify-content-between px-3 py-2">
      <button type="button" class="btn btn-sidebar btn-sm" aria-label="Abrir menu" :aria-expanded="state.isMobileOpen" @click="state.isMobileOpen = true">
        <i class="bi bi-list" aria-hidden="true" />
      </button>
      <AppLogo class="marca-logo marca-logo--topo" :rotulo="rotuloDoSite" />
      <div style="width: 38px" />
    </div>

    <aside :class="{ 'sidebar-collapsed': state.isCollapsed, 'sidebar-mobile-open': state.isMobileOpen }" aria-label="Menu do painel">
      <div class="d-flex flex-column w-100">
        <button
          type="button"
          class="btn btn-sidebar mb-3 d-none d-xl-block"
          :aria-label="state.isCollapsed ? 'Expandir menu' : 'Recolher menu'"
          :title="state.isCollapsed ? 'Expandir menu' : 'Recolher menu'"
          @click="state.isCollapsed = !state.isCollapsed"
        >
          <i class="bi bi-list" aria-hidden="true" />
        </button>
        <button type="button" class="btn btn-sidebar mb-3 d-xl-none align-self-end" aria-label="Fechar menu" @click="closeMobileSidebar">
          <i class="bi bi-x-lg" aria-hidden="true" />
        </button>

        <AppLogo
          class="marca-logo mb-3 align-self-center"
          :class="{ 'marca-logo--recolhido': state.isCollapsed }"
          :rotulo="rotuloDoSite"
        />

        <nav aria-label="Seções do painel">
          <ul class="nav flex-column">
            <template v-for="secao in menuVisivel" :key="secao.titulo">
              <li v-if="!state.isCollapsed" class="nav-section-header">{{ secao.titulo }}</li>
              <li v-for="item in secao.itens" :key="item.para" class="nav-item">
                <NuxtLink
                  :to="item.para"
                  class="nav-link"
                  :class="{ 'justify-content-center fs-5': state.isCollapsed }"
                  :title="item.rotulo"
                  :aria-label="item.rotulo"
                  @click="closeMobileSidebar"
                >
                  <i :class="['bi', item.icone]" aria-hidden="true" />
                  <span v-if="!state.isCollapsed">{{ item.rotulo }}</span>
                </NuxtLink>
              </li>
            </template>
          </ul>
        </nav>
      </div>

      <ul class="nav flex-column w-100 mt-4">
        <li class="nav-item">
          <a href="/" class="nav-link" :class="{ 'justify-content-center fs-5': state.isCollapsed }" title="Ver o site" aria-label="Ver o site">
            <i class="bi bi-box-arrow-up-right" aria-hidden="true" />
            <span v-if="!state.isCollapsed">Ver o site</span>
          </a>
        </li>
        <li class="nav-item tema" :class="{ 'tema--recolhido': state.isCollapsed }">
          <span v-if="!state.isCollapsed" id="tema-rotulo" class="tema__rotulo">Tema</span>
          <div class="tema__opcoes" role="radiogroup" :aria-labelledby="state.isCollapsed ? undefined : 'tema-rotulo'" :aria-label="state.isCollapsed ? 'Tema' : undefined">
            <button
              v-for="opcao in OPCOES_TEMA"
              :key="opcao"
              type="button"
              class="tema__opcao"
              :class="{ 'tema__opcao--ativa': opcao === tema.atual.value }"
              role="radio"
              :aria-checked="opcao === tema.atual.value"
              :aria-label="NOMES_TEMA[opcao]"
              :title="NOMES_TEMA[opcao]"
              @click="tema.definir(opcao)"
            >
              <i :class="['bi', ICONE_TEMA[opcao]]" aria-hidden="true" />
            </button>
          </div>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link w-100 border-0 bg-transparent text-start" :class="{ 'justify-content-center fs-5': state.isCollapsed }" title="Sair do painel" aria-label="Sair do painel" @click="sair">
            <i class="bi bi-box-arrow-left" aria-hidden="true" />
            <span v-if="!state.isCollapsed" class="text-truncate">Sair <span class="usuario">({{ auth.usuario?.nome }})</span></span>
          </button>
        </li>
      </ul>
    </aside>

    <main id="admin-conteudo" class="content" :class="{ 'content--largo': state.isCollapsed }" tabindex="-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '~/assets/css/admin.css'
import type { PreferenciaTema } from '~/composables/useTema'

useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const MENU = [
  {
    titulo: 'Geral',
    itens: [
      { para: '/admin/dashboard', rotulo: 'Dashboard', icone: 'bi-bar-chart', soDono: true },
      { para: '/admin/pedidos', rotulo: 'Pedidos', icone: 'bi-receipt' }
    ]
  },
  {
    titulo: 'Cardápio',
    soDono: true,
    itens: [
      { para: '/admin/sabores', rotulo: 'Sabores', icone: 'bi-pie-chart' },
      { para: '/admin/precos', rotulo: 'Tamanhos e preços', icone: 'bi-tags' },
      { para: '/admin/bordas', rotulo: 'Bordas', icone: 'bi-circle' },
      { para: '/admin/esfirras', rotulo: 'Esfirras', icone: 'bi-basket' },
      { para: '/admin/adicionais', rotulo: 'Adicionais', icone: 'bi-plus-circle' },
      { para: '/admin/bebidas', rotulo: 'Bebidas', icone: 'bi-cup-straw' }
    ]
  },
  {
    titulo: 'Configurações',
    soDono: true,
    itens: [
      { para: '/admin/configuracoes', rotulo: 'Pizzaria', icone: 'bi-shop' },
      { para: '/admin/privacidade', rotulo: 'Política de privacidade', icone: 'bi-shield-check' },
      { para: '/admin/usuarios', rotulo: 'Usuários', icone: 'bi-people' }
    ]
  }
]

const cardapio = useCardapioStore()
const auth = useAuthStore()

const menuVisivel = computed(() => {
  const dono = auth.usuario?.papel === 'dono'
  return MENU
    .filter((secao) => dono || !secao.soDono)
    .map((secao) => ({ ...secao, itens: secao.itens.filter((item) => dono || !item.soDono) }))
})

const rotuloDoSite = computed(() => `${cardapio.config.nome}, ir para o site`)

onMounted(() => {
  if (cardapio.erro) cardapio.carregar()
})

async function sair() {
  await auth.logout()
  await navigateTo('/login')
}
const tema = useTema()
const OPCOES_TEMA: PreferenciaTema[] = ['system', 'light', 'dark']
const ICONE_TEMA: Record<PreferenciaTema, string> = { system: 'bi-circle-half', light: 'bi-sun', dark: 'bi-moon' }

const state = reactive({
  isCollapsed: false,
  isMobileOpen: false
})

const closeMobileSidebar = () => { state.isMobileOpen = false }

watchEffect(() => {
  if (import.meta.client) document.documentElement.setAttribute('data-bs-theme', tema.escuro.value ? 'dark' : 'light')
})
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
}

.admin-pular {
  position: fixed;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 2000;
  padding: 0.5rem 1rem;
  background: var(--bs-body-bg);
  border-radius: 0.5rem;
}

aside {
  background-color: var(--sb-bg);
  border-right: 1px solid var(--sb-borda);
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 250px;
  padding: 1.5rem 1rem;
  overflow-y: auto;
  z-index: 1040;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: width 0.2s ease;
}

aside.sidebar-collapsed {
  width: 84px;
}

.content {
  margin-left: 250px;
  padding: 2rem;
  min-height: 100vh;
  transition: margin-left 0.2s ease;
}

.content:focus {
  outline: none;
}

.content--largo {
  margin-left: 84px;
}

.marca-logo {
  height: 7.5rem;
}

.marca-logo--recolhido {
  height: 3rem;
}

.marca-logo--topo {
  height: 2.5rem;
}

.mobile-topbar {
  display: none;
}

@media (max-width: 1199.98px) {
  aside,
  aside.sidebar-collapsed {
    width: 260px;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }

  aside.sidebar-mobile-open {
    transform: translateX(0);
  }

  aside {
    padding-block: 1rem;
  }

  aside .marca-logo:not(.marca-logo--topo) {
    height: 5rem;
    margin-bottom: 0.5rem !important;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1039;
  }

  .mobile-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1038;
    background-color: var(--sb-bg);
    border-bottom: 1px solid var(--sb-borda);
    height: 52px;
  }

  .content,
  .content--largo {
    margin-left: 0;
    padding: 1rem;
    padding-top: 68px;
  }
}

.nav-section-header {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--sb-secao);
  padding: 14px 8px 4px;
  user-select: none;
}

.nav-link {
  display: flex;
  column-gap: 0.5rem;
  color: var(--sb-fg);
  font-weight: 500;
  border-radius: 0.5rem;
  font-size: 14px;
  align-items: center;
  min-height: 2.5rem;
}

.nav-link:hover {
  background-color: var(--sb-hover);
  color: var(--sb-fg);
}

.nav-link:focus-visible {
  outline: 3px solid var(--sb-fg);
  outline-offset: -3px;
}

.router-link-active {
  color: #fff !important;
  background-color: var(--primary) !important;
  font-weight: bold !important;
}

.btn-sidebar {
  padding: 4px 10px;
  border: 1px solid var(--sb-borda-forte);
  color: var(--sb-fg);
  background: transparent;
}

.btn-sidebar:hover,
.btn-sidebar:focus-visible {
  background: var(--sb-hover);
  color: var(--sb-fg);
  border-color: var(--sb-borda-forte);
}

.tema {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem 0.25rem 0.75rem;
  margin: 0.25rem 0;
}

.tema__rotulo {
  color: var(--sb-fg);
  font-weight: 500;
  font-size: 14px;
}

.tema__opcoes {
  display: inline-flex;
  gap: 0.125rem;
  padding: 0.1875rem;
  border-radius: 999px;
  background: var(--sb-hover);
}

.tema__opcao {
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--sb-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.tema__opcao:hover {
  background: var(--sb-hover);
  color: var(--sb-fg);
}

.tema__opcao:focus-visible {
  outline: 2px solid var(--sb-fg);
  outline-offset: 1px;
}

.tema__opcao--ativa,
.tema__opcao--ativa:hover {
  background: var(--primary);
  color: #fff;
}

.tema--recolhido {
  justify-content: center;
  padding: 0.25rem 0;
}

.tema--recolhido .tema__opcoes {
  flex-direction: column;
  border-radius: 1.25rem;
}

.usuario {
  font-weight: 400;
  opacity: 0.75;
}
</style>

<style>
.admin-shell {
  --sb-bg: var(--surface);
  --sb-borda: var(--border);
  --sb-borda-forte: var(--border-strong);
  --sb-fg: var(--fg);
  --sb-muted: var(--muted);
  --sb-hover: var(--surface-2);
  --sb-secao: var(--accent-text);
}

html.dark .admin-shell {
  --sb-bg: #1f1712;
  --sb-borda: #2c231b;
  --sb-borda-forte: rgba(255, 255, 255, 0.4);
  --sb-fg: #ebebeb;
  --sb-muted: #cfc6bb;
  --sb-hover: rgba(255, 255, 255, 0.14);
  --sb-secao: #ff9a62;
}
</style>
