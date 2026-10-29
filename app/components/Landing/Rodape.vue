<template>
  <footer class="rodape mt-auto">
    <div class="container">
      <div class="row g-4 g-lg-5">
        <div class="col-12 col-lg-6">
          <AppLogo formato="horizontal" tom="clara" class="rodape__logo" rotulo="Lancelot Pizzas, página inicial" />
          <p class="rodape__texto mt-3 mb-3">
            Pizza montada em 3D, com até 4 sabores, e o pedido enviado pelo WhatsApp.
          </p>
          <NuxtLink to="/loja" class="btn btn-light fw-bold d-inline-flex align-items-center">Pedir agora</NuxtLink>
        </div>

        <nav v-for="grupo in GRUPOS" :key="grupo.titulo" class="col-6 col-lg-3" :aria-label="grupo.titulo">
          <p class="rodape__titulo">{{ grupo.titulo }}</p>
          <ul class="nav flex-column">
            <li v-for="link in grupo.links" :key="link.rotulo" class="nav-item">
              <a v-if="link.secao" class="nav-link px-0" :href="`#${link.secao}`" @click.prevent="rolar(link.secao)">{{ link.rotulo }}</a>
              <a v-else class="nav-link px-0" :href="link.para">{{ link.rotulo }}</a>
            </li>
          </ul>
        </nav>
      </div>

      <div class="rodape__base d-flex flex-wrap align-items-center justify-content-between gap-3 mt-5 pt-3 small">
        <p class="mb-0">
          © {{ ano }} Lancelot Pizzas. Todos os direitos reservados. Código protegido pela
          <a :href="LICENCA" class="rodape__legal" target="_blank" rel="noopener">licença</a>:
          uso, cópia e distribuição só com autorização do autor.
        </p>
        <NuxtLink to="/privacidade" class="rodape__legal">Política de privacidade</NuxtLink>
        <button type="button" class="rodape__topo btn btn-link d-inline-flex align-items-center gap-1 text-decoration-none fw-semibold" @click="irAoTopo">Voltar ao topo<BaseIcon nome="avancar" :tamanho="16" class="rodape__seta" /></button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const rolar = useRolarPara()
const reduzir = useReducedMotion()
const ano = new Date().getFullYear()
const LICENCA = 'https://github.com/nathanhenrick/lancelotPizzas/blob/main/LICENSE'

const GRUPOS = [
  {
    titulo: 'Como pedir',
    links: [
      { rotulo: 'Montar a pizza', secao: 'montador' },
      { rotulo: 'Ajustar sabores', secao: 'personalizar' },
      { rotulo: 'Fechar o pedido', secao: 'pedido' }
    ]
  },
  {
    titulo: 'Pedir agora',
    links: [
      { rotulo: 'Cardápio e pedido', para: '/loja' },
      { rotulo: 'Montar uma pizza', para: '/pizza' },
      { rotulo: 'Sobre a pizzaria', para: '/sobre' }
    ]
  }
]

function irAoTopo() {
  window.scrollTo({ top: 0, behavior: reduzir.value ? 'auto' : 'smooth' })
  document.getElementById('conteudo')?.focus({ preventScroll: true })
}
</script>

<style scoped>
.rodape {
  background: #160f09;
  color: #f1e9dd;
  padding: 3.5rem 0 calc(1.5rem + env(safe-area-inset-bottom));
}

.rodape__logo {
  height: 4.5rem;
}

.rodape__texto {
  max-width: 24rem;
  color: #c9bcab;
  line-height: 1.6;
}

.rodape__titulo {
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ff9a62;
}

.rodape .nav-link {
  padding-block: 0.4375rem;
  color: #f1e9dd;
  font-weight: 500;
}

.rodape .nav-link:hover {
  text-decoration: underline;
  text-underline-offset: 0.25rem;
}

.rodape__base {
  border-top: 1px solid #3a2e24;
  color: #c9bcab;
}

.rodape__legal {
  color: #f1e9dd;
  font-weight: 600;
}

.rodape__topo {
  min-height: 2.75rem;
  padding: 0 0.25rem;
  color: #f1e9dd;
}

.rodape__seta {
  rotate: -90deg;
}

.rodape :focus-visible {
  outline-color: #f1e9dd;
}
</style>
