<template>
  <main id="conteudo" class="erro" tabindex="-1">
    <div class="erro__fundo" aria-hidden="true">
      <svg class="erro__forma erro__forma--mancha" viewBox="0 0 200 200" focusable="false">
        <path d="M44 20C80-10 150 0 175 45s10 95-25 125-95 35-125-5S10 50 44 20z" />
      </svg>
      <svg class="erro__forma erro__forma--disco" viewBox="0 0 200 200" focusable="false">
        <circle cx="100" cy="100" r="96" />
        <circle class="erro__anel" cx="100" cy="100" r="74" />
      </svg>
      <svg class="erro__forma erro__forma--arco" viewBox="0 0 120 120" focusable="false">
        <path d="M12 112A100 100 0 0 1 112 12" />
      </svg>
      <svg class="erro__forma erro__forma--pinceladas" viewBox="0 0 120 90" focusable="false">
        <path class="erro__p1" d="M10 18h78" />
        <path class="erro__p2" d="M26 46h84" />
        <path class="erro__p3" d="M14 74h52" />
      </svg>
      <svg class="erro__forma erro__forma--pontos erro__forma--pontos-a" viewBox="0 0 100 100" focusable="false">
        <circle cx="12" cy="20" r="4" /><circle cx="38" cy="10" r="2.5" /><circle cx="62" cy="26" r="5" />
        <circle cx="26" cy="52" r="3" /><circle cx="52" cy="62" r="2.5" /><circle cx="84" cy="48" r="3.5" />
        <circle cx="14" cy="84" r="2.5" /><circle cx="44" cy="90" r="4" /><circle cx="78" cy="82" r="2.5" />
      </svg>
      <svg class="erro__forma erro__forma--pontos erro__forma--pontos-b" viewBox="0 0 100 100" focusable="false">
        <circle cx="20" cy="14" r="3" /><circle cx="50" cy="22" r="4.5" /><circle cx="80" cy="12" r="2.5" />
        <circle cx="10" cy="46" r="2.5" /><circle cx="36" cy="54" r="3.5" /><circle cx="70" cy="48" r="2.5" />
        <circle cx="90" cy="70" r="4" /><circle cx="28" cy="84" r="3" /><circle cx="58" cy="88" r="2.5" />
      </svg>
      <svg class="erro__forma erro__forma--onda" viewBox="0 0 240 40" focusable="false">
        <path d="M4 20c20-26 40-26 60 0s40 26 60 0 40-26 60 0 40 26 52 0" />
      </svg>
    </div>

    <div class="erro__miolo">
      <div class="erro__numero" aria-hidden="true">
        <span v-if="naoEncontrada" class="erro__digito">4</span>
        <svg class="erro__pizza" viewBox="-12 -24 232 232" focusable="false">
          <defs>
            <clipPath id="erro-corpo"><path d="M100 100 L172.1 49.5 A88 88 0 1 1 115.3 13.3 Z" /></clipPath>
            <clipPath id="erro-fatia"><path d="M100 100 L115.3 13.3 A88 88 0 0 1 172.1 49.5 Z" /></clipPath>
          </defs>

          <path class="erro__vazio" d="M100 100 L115.3 13.3 A88 88 0 0 1 172.1 49.5 Z" />

          <g clip-path="url(#erro-corpo)">
            <circle cx="100" cy="100" r="88" fill="#c98a45" />
            <circle cx="100" cy="100" r="77" fill="#f3c969" />
            <circle cx="78" cy="58" r="22" fill="#f8dc8c" opacity="0.65" />
            <circle cx="136" cy="140" r="26" fill="#f8dc8c" opacity="0.55" />
            <circle cx="62" cy="72" r="11" fill="#b3281a" />
            <circle cx="62" cy="72" r="7" fill="#c93b27" />
            <circle cx="70" cy="128" r="11" fill="#b3281a" />
            <circle cx="70" cy="128" r="7" fill="#c93b27" />
            <circle cx="112" cy="152" r="11" fill="#b3281a" />
            <circle cx="112" cy="152" r="7" fill="#c93b27" />
            <circle cx="150" cy="116" r="11" fill="#b3281a" />
            <circle cx="150" cy="116" r="7" fill="#c93b27" />
            <circle cx="44" cy="100" r="9" fill="#b3281a" />
            <ellipse cx="88" cy="96" rx="9" ry="5" fill="#3f8f4b" transform="rotate(-30 88 96)" />
            <ellipse cx="124" cy="92" rx="9" ry="5" fill="#3f8f4b" transform="rotate(25 124 92)" />
            <ellipse cx="100" cy="128" rx="9" ry="5" fill="#3f8f4b" transform="rotate(70 100 128)" />
          </g>

          <g class="erro__fatia">
            <g clip-path="url(#erro-fatia)">
              <circle cx="100" cy="100" r="88" fill="#c98a45" />
              <circle cx="100" cy="100" r="77" fill="#f3c969" />
              <circle cx="128" cy="56" r="11" fill="#b3281a" />
              <circle cx="128" cy="56" r="7" fill="#c93b27" />
              <ellipse cx="115" cy="76" rx="9" ry="5" fill="#3f8f4b" transform="rotate(-60 115 76)" />
            </g>
          </g>
        </svg>
        <span v-if="naoEncontrada" class="erro__digito">4</span>
      </div>

      <p class="erro__codigo">Erro {{ codigo }}</p>
      <h1 class="titulo erro__titulo">{{ titulo }}</h1>
      <p class="erro__texto">{{ texto }}</p>

      <div class="erro__acoes">
        <BaseButton v-if="naoEncontrada" @click="irPara('/pizza')">Montar minha pizza</BaseButton>
        <BaseButton v-else @click="tentarDeNovo">Tentar de novo</BaseButton>
        <BaseButton variante="contorno" @click="irPara('/')">Voltar ao início</BaseButton>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const codigo = computed(() => props.error.statusCode || 500)
const naoEncontrada = computed(() => codigo.value === 404)
const titulo = computed(() => (naoEncontrada.value ? 'Essa fatia não está no cardápio' : 'A pizza queimou no forno'))
const texto = computed(() => (naoEncontrada.value
  ? 'A página que você procurou não existe ou mudou de lugar. A pizza, essa continua quentinha.'
  : 'Algo deu errado do nosso lado. Tente de novo em instantes.'))

useHead({
  htmlAttrs: { lang: 'pt-BR' },
  title: computed(() => (naoEncontrada.value ? 'Página não encontrada' : 'Algo deu errado')),
  meta: [{ name: 'robots', content: 'noindex' }]
})

const irPara = (caminho: string) => clearError({ redirect: caminho })
const tentarDeNovo = () => reloadNuxtApp()
</script>

<style scoped>
.erro {
  position: relative;
  overflow: hidden;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  background: radial-gradient(ellipse 60% 45% at 50% 42%, var(--stage-glow) 0%, transparent 70%), var(--bg);
  color: var(--fg);
  text-align: center;
}

.erro__miolo {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: 0.875rem;
  max-width: 34rem;
}

.erro__numero {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.125rem, 1.5vw, 0.75rem);
}

.erro__digito {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(5.5rem, 30vw, 11rem);
  line-height: 0.9;
  letter-spacing: -0.04em;
  color: var(--primary);
}

.erro__pizza {
  width: clamp(6rem, 28vw, 11rem);
  height: auto;
  flex: none;
  overflow: visible;
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.28));
}

.erro__vazio {
  fill: none;
  stroke: var(--muted);
  stroke-width: 2;
  stroke-dasharray: 6 6;
  opacity: 0.7;
}

.erro__fatia {
  transform-box: view-box;
  transform-origin: 100px 100px;
  animation: erro-fatia 5s ease-in-out infinite;
}

@keyframes erro-fatia {
  0%,
  100% {
    transform: translate(10px, -12px) rotate(7deg);
  }

  50% {
    transform: translate(15px, -19px) rotate(11deg);
  }
}

.erro__codigo {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.erro__titulo {
  margin: 0;
  font-size: clamp(1.5rem, 6vw, 2.25rem);
}

.erro__texto {
  margin: 0;
  color: var(--muted);
}

.erro__acoes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.erro__fundo {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.erro__forma {
  position: absolute;
  overflow: visible;
  animation: erro-deriva var(--tempo, 16s) ease-in-out var(--atraso, 0s) infinite;
}

@keyframes erro-deriva {
  0%,
  100% {
    translate: 0 0;
    rotate: 0deg;
  }

  50% {
    translate: 0.5rem -0.75rem;
    rotate: 3deg;
  }
}

.erro__forma--mancha {
  width: min(46vw, 28rem);
  top: -9%;
  left: -9%;
  fill: color-mix(in srgb, var(--primary) 14%, transparent);
}

.erro__forma--disco {
  width: min(44vw, 26rem);
  bottom: -16%;
  right: -9%;
  --tempo: 20s;
  --atraso: -6s;
  fill: color-mix(in srgb, #f3c969 22%, transparent);
}

.erro__anel {
  fill: none;
  stroke: color-mix(in srgb, #c98a45 45%, transparent);
  stroke-width: 2.5;
}

.erro__forma--arco {
  width: min(30vw, 17rem);
  bottom: -4%;
  left: -3%;
  --tempo: 18s;
  --atraso: -3s;
  fill: none;
  stroke: color-mix(in srgb, #3f8f4b 24%, transparent);
  stroke-width: 20;
  stroke-linecap: round;
}

.erro__forma--pinceladas {
  width: min(16vw, 9rem);
  top: 8%;
  right: 6%;
  rotate: -10deg;
  --tempo: 14s;
  --atraso: -2s;
  fill: none;
  stroke-width: 11;
  stroke-linecap: round;
}

.erro__p1 { stroke: color-mix(in srgb, var(--primary) 30%, transparent); }
.erro__p2 { stroke: color-mix(in srgb, #f3c969 55%, transparent); }
.erro__p3 { stroke: color-mix(in srgb, #3f8f4b 30%, transparent); }

.erro__forma--pontos {
  width: min(11vw, 6rem);
  fill: color-mix(in srgb, var(--fg) 24%, transparent);
}

.erro__forma--pontos-a {
  top: 44%;
  left: 5%;
  --tempo: 12s;
}

.erro__forma--pontos-b {
  top: 50%;
  right: 6%;
  --tempo: 15s;
  --atraso: -4s;
  fill: color-mix(in srgb, var(--primary) 38%, transparent);
}

.erro__forma--onda {
  width: min(24vw, 14rem);
  bottom: 9%;
  left: 36%;
  --tempo: 13s;
  --atraso: -5s;
  fill: none;
  stroke: color-mix(in srgb, var(--border-strong) 50%, transparent);
  stroke-width: 3;
  stroke-linecap: round;
}

@media (max-width: 640px) {
  .erro__forma--mancha { width: 62vw; top: -10%; left: -16%; }
  .erro__forma--disco { width: 66vw; bottom: -14%; right: -22%; }
  .erro__forma--arco { width: 36vw; bottom: 1%; left: -8%; }
  .erro__forma--pinceladas { width: 26vw; top: 5%; right: 4%; }
  .erro__forma--pontos-b,
  .erro__forma--onda { display: none; }
  .erro__forma--pontos-a { width: 20vw; top: 36%; left: 2%; }
}

@media (prefers-reduced-motion: reduce) {
  .erro__fatia {
    animation: none;
    transform: translate(12px, -14px) rotate(8deg);
  }

  .erro__forma {
    animation: none;
  }
}
</style>
