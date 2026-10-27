<template>
  <main id="conteudo" class="sobre" tabindex="-1">
    <div class="sobre__miolo">
      <NuxtLink :to="voltarPara" class="sobre__voltar"><BaseIcon nome="voltar" :tamanho="18" /> Voltar para o pedido</NuxtLink>

      <h1 class="titulo sobre__titulo">{{ c.nome }}</h1>
      <p v-if="c.razao_social || c.cnpj" class="sobre__legal">
        {{ [c.razao_social, c.cnpj ? `CNPJ ${formatarCnpj(c.cnpj)}` : ''].filter(Boolean).join(' · ') }}
      </p>
      <p v-if="c.descricao" class="sobre__texto">{{ c.descricao }}</p>

      <section v-if="temContato" class="cartao" aria-labelledby="s-contato">
        <h2 id="s-contato" class="cartao__titulo">Fale com a gente</h2>
        <ul class="lista">
          <li v-if="whatsappNumero"><span>WhatsApp</span><a :href="`https://wa.me/${whatsappNumero}`" target="_blank" rel="noopener">{{ formatarTelefone(whatsappNumero.replace(/^55/, '')) }}</a></li>
          <li v-if="c.telefone"><span>Telefone</span><a :href="`tel:+55${apenasDigitos(c.telefone)}`">{{ formatarTelefone(c.telefone) }}</a></li>
          <li v-if="c.email"><span>E-mail</span><a :href="`mailto:${c.email}`">{{ c.email }}</a></li>
          <li v-if="c.instagram"><span>Instagram</span><a :href="linkInstagram(c.instagram)" target="_blank" rel="noopener">@{{ c.instagram.replace(/^@/, '') }}</a></li>
          <li v-if="c.facebook"><span>Facebook</span><a :href="linkFacebook(c.facebook)" target="_blank" rel="noopener">{{ c.facebook }}</a></li>
        </ul>
      </section>

      <section v-if="endereco" class="cartao" aria-labelledby="s-endereco">
        <h2 id="s-endereco" class="cartao__titulo">Onde estamos</h2>
        <p class="sobre__texto">{{ endereco }}</p>
        <a :href="linkMapa(c)" target="_blank" rel="noopener" class="cartao__link">Ver no mapa<span class="sr-only"> (abre em nova aba)</span></a>
      </section>

      <section v-if="horarios.some((h) => !h.fechado)" class="cartao" aria-labelledby="s-horarios">
        <h2 id="s-horarios" class="cartao__titulo">Horário de funcionamento</h2>
        <ul class="lista">
          <li v-for="(h, i) in horarios" :key="h.dia" :class="{ 'lista__hoje': i === hoje }">
            <span>{{ h.dia }}<template v-if="i === hoje"> (hoje)</template></span>
            <span>{{ resumoHorario(h) }}</span>
          </li>
        </ul>
      </section>

      <section v-if="temAtendimento" class="cartao" aria-labelledby="s-atendimento">
        <h2 id="s-atendimento" class="cartao__titulo">Entrega, retirada e pagamento</h2>
        <ul class="lista">
          <li v-if="c.tempo_entrega"><span>Entrega</span><span>{{ c.tempo_entrega }}</span></li>
          <li v-if="c.tempo_retirada"><span>Retirada no balcão</span><span>{{ c.tempo_retirada }}</span></li>
          <li v-if="c.taxa_entrega"><span>Taxa de entrega</span><span>{{ c.taxa_entrega }}</span></li>
          <li v-if="c.area_entrega"><span>Onde entregamos</span><span>{{ c.area_entrega }}</span></li>
          <li v-if="c.formas_pagamento"><span>Pagamento</span><span>{{ c.formas_pagamento }}</span></li>
        </ul>
      </section>

      <section class="cartao" aria-labelledby="s-privacidade">
        <h2 id="s-privacidade" class="cartao__titulo">Privacidade e proteção de dados (LGPD)</h2>
        <template v-if="politicaGlobal.length">
          <p v-for="(par, i) in politicaGlobal" :key="i" class="sobre__texto">{{ par }}</p>
          <p v-if="politica?.atualizado_em" class="sobre__legal">Atualizado em {{ politica.atualizado_em }}</p>
        </template>
        <template v-else>
          <div v-for="secao in politicaPadrao(c, politica ?? undefined)" :key="secao.titulo" class="politica">
            <h3 class="politica__titulo">{{ secao.titulo }}</h3>
            <p v-for="(par, i) in secao.paragrafos" :key="i" class="sobre__texto">{{ par }}</p>
          </div>
          <p v-if="c.atualizado_em" class="sobre__legal">Atualizado em {{ c.atualizado_em }}</p>
        </template>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
const cardapio = useCardapioStore()
const pedido = usePedidoStore()
const inicio = '/loja'
const voltarPara = computed(() => (pedido.produto === 'esfirra' ? '/esfirras' : pedido.produto === 'pizza' ? '/pizza' : inicio))
const runtime = useRuntimeConfig().public
const c = computed(() => cardapio.config)

usePaginaSeo({
  titulo: 'Sobre',
  descricao: () => c.value.descricao || 'Contato, endereço, horários e política de privacidade.',
  caminho: '/sobre'
})

const urlDaPagina = new URL('/sobre', String(runtime.siteUrl || '') || useRequestURL().origin).toString()
useHead({
  script: [{ type: 'application/ld+json', innerHTML: () => jsonParaScript(dadosEstruturadosNegocio(c.value, urlDaPagina)) }]
})

const whatsappDaLoja = useWhatsappDaLoja()
const whatsappNumero = computed(() => apenasDigitos(whatsappDaLoja.value))
const endereco = computed(() => enderecoCompleto(c.value))
const horarios = computed(() => horariosCompletos(c.value.horarios))
const hoje = computed(() => (new Date().getDay() + 6) % 7)

const temContato = computed(() => Boolean(whatsappNumero.value || c.value.telefone || c.value.email || c.value.instagram || c.value.facebook))
const temAtendimento = computed(() => Boolean(c.value.tempo_entrega || c.value.tempo_retirada || c.value.taxa_entrega || c.value.area_entrega || c.value.formas_pagamento))

const { $services } = useNuxtApp()
const { data: politica } = await useAsyncData('politica-privacidade', async () => {
  try {
    return (await $services.politica.get()).data
  } catch {
    return null
  }
})
const politicaGlobal = computed(() => (politica.value?.texto ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean))
</script>

<style scoped>
.sobre {
  overflow-y: auto;
  min-height: 0;
  padding: 1.25rem 1rem 3rem;
}

.sobre:focus {
  outline: none;
}

.sobre__miolo {
  max-width: 44rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sobre__voltar {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--accent-text);
  font-weight: 600;
}

.sobre__titulo {
  font-size: 2rem;
}

.sobre__legal {
  font-size: 0.8125rem;
  color: var(--muted);
}

.sobre__texto {
  line-height: 1.6;
  white-space: pre-line;
}

.cartao {
  padding: 1rem 1.125rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.cartao__titulo {
  font-family: var(--font-display);
  font-size: 1.125rem;
}

.cartao__link {
  align-self: flex-start;
  color: var(--accent-text);
  font-weight: 600;
}

.lista {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.lista li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}

.lista li:last-child {
  border-bottom: 0;
}

.lista li > :first-child {
  color: var(--muted);
}

.lista li > :last-child {
  text-align: right;
}

.lista a {
  color: var(--accent-text);
  font-weight: 600;
}

.lista__hoje {
  font-weight: 700;
}

.politica__titulo {
  margin: 0.5rem 0 0.25rem;
  font-size: 0.9375rem;
  font-weight: 700;
}
</style>
