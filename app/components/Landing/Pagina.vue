<template>
  <main id="conteudo" ref="raiz" tabindex="-1" class="lp">
    <section class="hero" aria-labelledby="hero-titulo">
      <div class="hero__miolo container">
        <div class="row align-items-center g-4 g-lg-5">
          <div class="col-lg-6">
            <h1 id="hero-titulo" class="hero__titulo d-grid gap-3 mb-0">
              <span class="hero__linha1">Você <span class="hero__marca">monta</span> a pizza.</span>
              <span class="hero__linha2">O pedido chega pronto no nosso <span class="hero__zap">WhatsApp</span>.</span>
            </h1>
            <p class="hero__sub mt-4 mb-0">
              Escolha até 4 sabores na mesma pizza, veja ela em 3D antes de pedir e envie o pedido pelo WhatsApp. Entrega ou retirada no balcão.
            </p>
            <div class="d-flex flex-wrap gap-2 mt-4">
              <NuxtLink to="/loja" class="btn btn-light btn-lg fw-bold d-inline-flex align-items-center justify-content-center gap-2">Pedir agora<BaseIcon nome="avancar" :tamanho="20" /></NuxtLink>
              <NuxtLink to="/sobre" class="btn btn-outline-light btn-lg fw-bold d-inline-flex align-items-center justify-content-center">Conhecer a pizzaria</NuxtLink>
            </div>
            <p class="hero__nota small mt-3 mb-0">Sem cadastro: monte a pizza, escolha entrega ou retirada e envie.</p>
          </div>

          <div class="col-lg-6">
            <div class="hero__arte position-relative">
              <img
                src="/img/lp/pizza-recorte.webp?v=6"
                alt="Pizza 3D dividida em quatro partes, cada uma com um sabor, montada no site de pedidos."
                width="1728"
                height="1346"
                fetchpriority="high"
                class="hero__pizza position-absolute"
              >
              <LandingJanela
                arquivo="montador-celular"
                alt="O site de pedidos no celular, com a pizza dividida em quatro partes."
                :largura="780"
                :altura="1688"
                celular
                prioridade
                class="hero__celular position-absolute"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container">
      <ul class="fatos row row-cols-2 row-cols-md-4 g-3 list-unstyled mt-5 mb-0 py-3 border-top border-bottom" aria-label="Resumo do pedido online">
        <li v-for="(f, i) in FATOS" :key="f.t" class="col" data-revela :style="{ '--i': i }"><strong class="d-block">{{ f.t }}</strong> {{ f.d }}</li>
      </ul>

      <div class="row gx-xl-5 pt-5 pb-3">
        <div class="col-xl-2 d-none d-xl-block">
          <nav class="guia__indice sticky-top" aria-label="Nesta página">
            <p class="guia__indice-titulo text-uppercase fw-bold mb-3">Nesta página</p>
            <ol class="nav flex-column border-start border-2 ps-3 list-unstyled mb-0">
              <li v-for="(item, i) in INDICE" :key="item.id" class="nav-item"><a class="nav-link d-flex gap-2 px-0" :href="`#${item.id}`" @click.prevent="rolar(item.id)"><span>{{ String(i + 1).padStart(2, '0') }}</span>{{ item.rotulo }}</a></li>
            </ol>
          </nav>
        </div>

        <div class="col-xl-10 d-grid gap-5">
          <section v-for="(ex, i) in EXEMPLOS" :id="ex.id" :key="ex.id" class="exemplo" :aria-labelledby="`ex-${ex.id}`">
            <h2 :id="`ex-${ex.id}`" class="exemplo__titulo d-flex align-items-baseline gap-3 mb-4" data-revela><span class="exemplo__num" aria-hidden="true">{{ i + 1 }}</span>{{ ex.titulo }}</h2>
            <div class="row g-3 g-md-4 align-items-end">
              <div class="col-md">
                <LandingJanela
                  :arquivo="ex.arquivo"
                  :alt="ex.alt"
                  data-revela
                />
              </div>
              <div class="exemplo__celular col-8 col-sm-5 col-md-auto mx-auto">
                <LandingJanela
                  :arquivo="`${ex.arquivo}-celular`"
                  :alt="ex.altCelular"
                  :largura="780"
                  :altura="1688"
                  celular
                  data-revela
                  :style="{ '--i': 2 }"
                />
              </div>
            </div>
            <dl class="meta row g-4 mt-0 mb-0" data-revela>
              <div class="col-md-6"><dt>Como pedir</dt><dd>{{ ex.cliente }}</dd></div>
              <div class="col-md-6"><dt>O que tem</dt><dd>{{ ex.recursos }}</dd></div>
              <div class="col-12"><dt>Na prática</dt><dd>{{ ex.texto }}</dd></div>
            </dl>
          </section>
        </div>
      </div>

      <section class="final row align-items-center g-4 mx-0 my-5 rounded-5 overflow-hidden position-relative p-4 p-md-5" aria-labelledby="final-titulo" data-revela>
        <div class="final__texto col-lg-7">
          <h2 id="final-titulo" class="final__titulo mb-3">Bateu a fome? Monte a sua pizza</h2>
          <p class="mb-0">Escolha os sabores, veja a pizza em 3D e envie o pedido pelo WhatsApp.</p>
          <div class="d-flex flex-wrap gap-2 mt-4">
            <NuxtLink to="/loja" class="btn btn-light btn-lg fw-bold d-inline-flex align-items-center justify-content-center gap-2">Pedir agora<BaseIcon nome="avancar" :tamanho="20" /></NuxtLink>
            <NuxtLink to="/sobre" class="btn btn-outline-light btn-lg fw-bold d-inline-flex align-items-center justify-content-center">Conhecer a pizzaria</NuxtLink>
          </div>
        </div>
        <div class="col-lg-5">
          <img src="/img/lp/pizza-recorte.webp?v=6" alt="" width="1728" height="1346" loading="lazy" class="final__pizza">
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
usePaginaSeo({
  titulo: 'Peça pizza online',
  descricao: 'Monte a sua pizza de até 4 sabores em 3D, peça esfirras e bebidas e envie o pedido pelo WhatsApp. Entrega ou retirada no balcão.',
  caminho: '/'
})

useHead({
  script: [{
    innerHTML: "(function(){var d=document.documentElement;d.classList.add('lp-gate');var f=function(){d.classList.remove('lp-gate')};if(!document.fonts||!document.fonts.load){f();return}setTimeout(f,700);var go=function(){Promise.all([document.fonts.load('800 1em Montserrat'),document.fonts.load('1em Limelight')]).then(f,f)};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go()})()",
    tagPosition: 'head'
  }]
})

const raiz = ref<HTMLElement | null>(null)
useRevelarAoRolar(raiz)
const rolar = useRolarPara()

const FATOS = [
  { t: 'Até 4', d: 'sabores na mesma pizza' },
  { t: '3D', d: 'veja a pizza antes de pedir' },
  { t: 'WhatsApp', d: 'o pedido chega montado' },
  { t: 'Entrega', d: 'ou retirada no balcão' }
]

const INDICE = [
  { id: 'montador', rotulo: 'Montar a pizza' },
  { id: 'personalizar', rotulo: 'Ajustar sabores' },
  { id: 'pedido', rotulo: 'Fechar o pedido' }
]

const EXEMPLOS = [
  {
    id: 'montador',
    arquivo: 'montador',
    titulo: 'Divida a pizza em até 4 partes',
    alt: 'Pizza 3D dividida em quatro partes com Calabresa, Marguerita, Portuguesa e Frango com Catupiry, e a lista de bordas ao lado.',
    altCelular: 'A mesma tela no celular: a pizza em cima e as escolhas embaixo.',
    cliente: 'escolha o tamanho e a borda, divida a pizza em 1 a 4 partes e toque em cada uma para escolher o sabor.',
    recursos: 'pizza 3D que gira, nome do sabor ao passar o mouse (ou segurar o dedo) numa parte, prévia do preço e lista de partes para teclado e leitor de tela.',
    texto: 'Sem descrever "metade calabresa, metade marguerita" por mensagem. Você vê a pizza como vai chegar e a gente recebe cada parte separada, sem confusão.'
  },
  {
    id: 'personalizar',
    arquivo: 'ajuste',
    titulo: 'Ajuste cada sabor',
    alt: 'Tela Personalizar sabor: ingredientes que podem ser removidos, adicionais com preço e campo de observação.',
    altCelular: 'A tela de ajustar o sabor no celular.',
    cliente: 'tire cebola, some bacon ou catupiry e deixe uma observação para aquele sabor.',
    recursos: 'ingredientes que podem sair, adicionais com o preço de cada um e observação por sabor.',
    texto: 'A pizza na tela se atualiza na hora. O valor final é calculado pelo sistema quando você envia o pedido.'
  },
  {
    id: 'pedido',
    arquivo: 'pedido',
    titulo: 'O pedido sai pronto para a cozinha',
    alt: 'Resumo do pedido com os quatro sabores, total, escolha entre entrega e retirada e botão Enviar pedido pelo WhatsApp.',
    altCelular: 'O resumo do pedido no celular.',
    cliente: 'confira o resumo, escolha entrega ou retirada no balcão, informe o seu nome e envie.',
    recursos: 'esfirras e bebidas no mesmo pedido e a mensagem do WhatsApp já montada para você.',
    texto: 'Você não digita o pedido: a mensagem vai pronta e a gente recebe o seu número junto com ela.'
  }
]
</script>

<style scoped>
.lp {
  --lp-escuro: #160f09;
  --lp-creme: #f1e9dd;
  --lp-terracota: #b93a0a;
  --lp-glow: 0.4;
  --lp-vivo:
    radial-gradient(55% 80% at 76% 45%, rgba(255, 176, 70, var(--lp-glow)) 0%, rgba(255, 176, 70, 0) 65%),
    radial-gradient(40% 60% at 6% 100%, rgba(95, 20, 4, 0.55) 0%, rgba(95, 20, 4, 0) 70%),
    radial-gradient(30% 45% at 38% 0%, rgba(255, 140, 60, 0.35) 0%, rgba(255, 140, 60, 0) 70%),
    linear-gradient(135deg, #c13e0a 0%, #df5410 55%, #f26a14 100%);
  color: var(--fg);
  overflow-x: clip;
}

.lp:focus {
  outline: none;
}

.lp [id] {
  scroll-margin-top: 5.5rem;
}

.anima [data-revela] {
  opacity: 0;
  translate: 0 1.5rem;
  transition: opacity 0.6s ease, translate 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
  transition-delay: calc(var(--i, 0) * 90ms);
}

.anima [data-revela].revelado {
  opacity: 1;
  translate: 0 0;
}

.btn {
  min-height: 3.25rem;
  border-radius: var(--radius-lg);
  transition: transform 0.15s ease, background-color 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.hero {
  position: relative;
  background: var(--lp-vivo);
  color: var(--lp-creme);
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 38%;
  left: 74%;
  width: 52rem;
  aspect-ratio: 1;
  translate: -50% -50%;
  border-radius: 50%;
  background: repeating-radial-gradient(circle, transparent 0 3.25rem, rgba(241, 233, 221, 0.09) 3.25rem calc(3.25rem + 2px));
  mask-image: radial-gradient(circle, #000 20%, transparent 70%);
  pointer-events: none;
}

.hero__miolo {
  position: relative;
  transition: opacity 0.3s ease;
  padding-block: 3rem 4.5rem;
}

.hero__titulo {
  font-family: var(--font-display);
  letter-spacing: -0.02em;
}

.hero__linha1 {
  font-weight: 800;
  font-size: clamp(1.875rem, 4.6vw, 3rem);
  line-height: 1.25;
  text-wrap: balance;
}

.hero__marca {
  display: inline-block;
  padding: 0 0.3em 0.04em;
  border-radius: 0.22em;
  background: var(--lp-creme);
  color: var(--lp-terracota);
  font-family: var(--font-destaque);
  font-weight: 400;
  letter-spacing: 0;
  rotate: -2.5deg;
  box-shadow: 0 0.12em 0 rgba(60, 14, 2, 0.35);
}

.hero__linha2 {
  font-weight: 600;
  font-size: clamp(1.0625rem, 2vw, 1.375rem);
  line-height: 1.35;
  text-wrap: balance;
  letter-spacing: -0.01em;
}

.hero__zap {
  text-decoration: underline wavy var(--lp-creme) 2px;
  text-underline-offset: 0.3em;
  text-decoration-skip-ink: none;
}

.hero__sub {
  max-width: 32rem;
  font-size: 1.125rem;
  line-height: 1.6;
}

.hero__nota {
  opacity: 0.9;
}

.hero :focus-visible,
.final :focus-visible {
  outline-color: var(--lp-creme);
}

.hero__arte {
  min-height: 22rem;
}

.hero__pizza {
  top: 0;
  left: -8%;
  width: 118%;
  max-width: none;
  height: auto;
  rotate: -6deg;
  filter: drop-shadow(0 24px 30px rgba(0, 0, 0, 0.3));
  animation: entra 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

.hero__celular {
  right: 0;
  bottom: 0;
  width: 8.5rem;
  animation: entra 0.9s 0.15s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

@keyframes entra {
  from {
    opacity: 0;
  }
}

.fatos li {
  font-size: 0.875rem;
  color: var(--muted);
  line-height: 1.4;
}

.fatos strong {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.5rem;
  color: var(--fg);
}

.guia__indice {
  top: 6rem;
  z-index: 1;
}

.guia__indice-titulo {
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.guia__indice .nav-link {
  color: var(--fg);
  font-weight: 600;
  font-size: 0.9375rem;
}

.guia__indice .nav-link:hover {
  color: var(--accent-text);
}

.guia__indice .nav-link span {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.exemplo__titulo {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  line-height: 1.15;
  letter-spacing: -0.015em;
}

.exemplo__num {
  color: var(--accent-text);
}

.exemplo__num::after {
  content: '.';
}

.meta {
  margin-top: 0.5rem;
  line-height: 1.6;
}

.meta > div {
  margin-top: 1.5rem;
}

.meta > div::before {
  content: '';
  display: block;
  margin-bottom: 0.875rem;
  border-top: 2px solid var(--fg);
}

.meta dt {
  margin-bottom: 0.25rem;
  font-weight: 800;
}

.meta dd {
  margin: 0;
  color: var(--muted);
}

.final {
  background: var(--lp-vivo);
  color: var(--lp-creme);
}

.final__titulo {
  max-width: 30rem;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(1.75rem, 4.5vw, 2.75rem);
  line-height: 1.1;
  letter-spacing: -0.015em;
}

.final__texto > p {
  max-width: 30rem;
  line-height: 1.6;
}

.final__pizza {
  width: 120%;
  max-width: none;
  height: auto;
  margin: 0 -10% -20%;
  rotate: 8deg;
  filter: drop-shadow(0 18px 24px rgba(0, 0, 0, 0.3));
}

@media (min-width: 768px) {
  .exemplo__celular {
    width: 10.5rem;
  }
}

@media (min-width: 992px) {
  .lp {
    --lp-glow: 0.7;
  }

  .hero__miolo {
    padding-block: 5rem 7rem;
  }

  .hero__arte {
    min-height: 30rem;
  }

  .hero__pizza {
    left: -6%;
    width: 140%;
  }

  .hero__celular {
    left: 0;
    right: auto;
    bottom: -1.5rem;
    width: 11rem;
  }

  .final__pizza {
    width: 125%;
    margin: -20% -20% -30% 0;
  }
}

@media (min-width: 1200px) {
  .exemplo__celular {
    width: 12rem;
  }
}
</style>

<style>
html.lp-gate .hero__miolo {
  opacity: 0;
}
</style>
