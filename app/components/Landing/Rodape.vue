<template>
  <footer class="rodape">
    <div class="rodape__miolo container">
      <div class="rodape__marca">
        <AppLogo formato="horizontal" tom="clara" class="rodape__logo" rotulo="Lancelot Pizzas, página inicial" />
        <p class="rodape__texto">
          Pizza montada em 3D, com até 4 sabores, e o pedido enviado pelo WhatsApp.
        </p>
        <NuxtLink to="/loja" class="rodape__cta">Pedir agora</NuxtLink>
      </div>

      <nav v-for="grupo in GRUPOS" :key="grupo.titulo" class="rodape__grupo" :aria-label="grupo.titulo">
        <p class="rodape__titulo">{{ grupo.titulo }}</p>
        <ul>
          <li v-for="link in grupo.links" :key="link.rotulo">
            <a v-if="link.secao" :href="`#${link.secao}`" @click.prevent="rolar(link.secao)">{{ link.rotulo }}</a>
            <a v-else :href="link.para">{{ link.rotulo }}</a>
          </li>
        </ul>
      </nav>
    </div>

    <div class="rodape__base container">
      <p>
        © {{ ano }} Lancelot Pizzas. Todos os direitos reservados. Código protegido pela
        <a :href="LICENCA" class="rodape__legal" target="_blank" rel="noopener">licença</a>:
        uso, cópia e distribuição só com autorização do autor.
      </p>
      <NuxtLink to="/privacidade" class="rodape__legal">Política de privacidade</NuxtLink>
      <button type="button" class="rodape__topo" @click="irAoTopo">Voltar ao topo<BaseIcon nome="avancar" :tamanho="16" class="rodape__seta" /></button>
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
  margin-top: auto;
  background: #160f09;
  color: #f1e9dd;
  padding: 3.5rem 0 calc(1.5rem + env(safe-area-inset-bottom));
}

.rodape__miolo {
  display: grid;
  gap: 2.5rem 2rem;
  grid-template-columns: repeat(2, 1fr);
}

.rodape__marca {
  grid-column: 1 / -1;
  display: grid;
  gap: 1rem;
  justify-items: start;
}

.rodape__logo {
  height: 4.5rem;
}

.rodape__texto {
  max-width: 24rem;
  color: #c9bcab;
  line-height: 1.6;
}

.rodape__cta {
  min-height: 2.75rem;
  padding: 0 1.25rem;
  display: inline-flex;
  align-items: center;
  border-radius: 0.75rem;
  background: #f1e9dd;
  color: #160f09;
  font-weight: 700;
  text-decoration: none;
}

.rodape__titulo {
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ff9a62;
}

.rodape__grupo ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.rodape__grupo a {
  display: inline-block;
  padding: 0.4375rem 0;
  color: #f1e9dd;
  text-decoration: none;
  font-weight: 500;
}

.rodape__grupo a:hover {
  text-decoration: underline;
  text-underline-offset: 0.25rem;
}

.rodape__base {
  margin-top: 3rem;
  padding-top: 1.25rem;
  border-top: 1px solid #3a2e24;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #c9bcab;
}

.rodape__legal {
  color: #f1e9dd;
  font-weight: 600;
}

.rodape__topo {
  min-height: 2.75rem;
  padding: 0 0.25rem;
  border: 0;
  background: transparent;
  color: #f1e9dd;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 600;
}

.rodape__seta {
  rotate: -90deg;
}

.rodape :focus-visible {
  outline-color: #f1e9dd;
}

@media (min-width: 900px) {
  .rodape__miolo {
    grid-template-columns: 1.5fr repeat(3, 1fr);
  }

  .rodape__marca {
    grid-column: auto;
  }
}
</style>
