<template>
  <div ref="caixa" class="pizza">
    <canvas
      ref="tela"
      class="pizza__tela"
      :class="{ 'pizza__tela--clicavel': interativa }"
      role="img"
      :aria-label="descricao"
      @pointerdown="aoPressionar"
      @pointermove="aoMover"
      @pointerup="aoSoltar"
      @pointercancel="cancelar"
      @pointerleave="aoSair"
      @contextmenu.prevent
    />
    <Transition name="rotulo">
      <div v-if="rotulo" class="pizza__rotulo" :style="{ left: `${rotulo.x}px`, top: `${rotulo.y}px` }" aria-hidden="true">{{ rotulo.texto }}</div>
    </Transition>
    <Loader v-if="!carregada" class="pizza__carregando" :tamanho="72" texto="Preparando a pizza…" />
  </div>
</template>

<script setup lang="ts">
import type { PizzaRenderer } from '~/lib/pizza/renderer'
import type { PizzaVisual } from '~/types/pizza'

const props = withDefaults(defineProps<{
  visual: PizzaVisual
  descricao: string
  interativa: boolean
  animar?: boolean
}>(), { animar: true })

const emit = defineEmits<{
  selecionar: [parte: number]
  destaque: [parte: number]
  pronta: [modo: '3d' | '2.5d']
}>()

const caixa = ref<HTMLDivElement>()
const carregada = ref(false)
const tela = ref<HTMLCanvasElement>()
const reduzirMovimento = useReducedMotion()

let renderer: PizzaRenderer | undefined
let observador: ResizeObserver | undefined
let arrasto: { x: number, rot: number, alvo: string | null, moveu: boolean } | null = null
let destaqueAtual = -1

const rotulo = ref<{ x: number, y: number, texto: string } | null>(null)
const TEMPO_SEGURAR = 450
let timerSegurar: ReturnType<typeof setTimeout> | undefined
let timerEsconder: ReturnType<typeof setTimeout> | undefined
let segurou = false

onMounted(async () => {
  const { PizzaRenderer } = await import('~/lib/pizza/renderer')
  if (!tela.value || !caixa.value) return
  renderer = new PizzaRenderer(tela.value, { reduzirMovimento: reduzirMovimento.value, animarEntrada: props.animar })
  renderer.atualizar(props.visual)
  observador = new ResizeObserver(([entrada]) => {
    if (entrada) renderer?.redimensionar(entrada.contentRect.width, entrada.contentRect.height)
  })
  observador.observe(caixa.value)
  emit('pronta', renderer.modo)
  carregada.value = true
})

onBeforeUnmount(() => {
  clearTimeout(timerSegurar)
  clearTimeout(timerEsconder)
  observador?.disconnect()
  renderer?.destruir()
  renderer = undefined
})

const colorMode = useColorMode()
watch(() => colorMode.value, async () => {
  await nextTick()
  renderer?.atualizar(props.visual)
})

watch(() => props.visual, (novo, antigo) => {
  renderer?.atualizar(novo, novo.qtd !== antigo.qtd || novo.escala !== antigo.escala || novo.corRecheio !== antigo.corRecheio)
})

function textoDaParte(parte: number): string {
  const sabor = props.visual.partes[parte]
  const fracao = props.visual.qtd > 1 ? `${parte + 1}/${props.visual.qtd} · ` : ''
  return `${fracao}${sabor ? sabor.nome : 'Sem sabor escolhido'}`
}

function mostrarRotulo(e: PointerEvent, parte: number) {
  if (parte < 0 || !caixa.value) { rotulo.value = null; return }
  const b = caixa.value.getBoundingClientRect()
  const toque = e.pointerType !== 'mouse'
  clearTimeout(timerEsconder)
  rotulo.value = {
    x: Math.min(Math.max(e.clientX - b.left, 70), b.width - 70),
    y: Math.max(e.clientY - b.top - (toque ? 56 : 28), 16),
    texto: textoDaParte(parte)
  }
}

function esconderRotulo(depois = 0) {
  clearTimeout(timerEsconder)
  if (depois) timerEsconder = setTimeout(() => { rotulo.value = null }, depois)
  else rotulo.value = null
}

function parteDoEvento(e: PointerEvent): number {
  if (!renderer || !tela.value) return -1
  return renderer.parteEm(...pontoDoEvento(e))
}

function destacar(parte: number) {
  if (parte === destaqueAtual) return
  destaqueAtual = parte
  emit('destaque', parte)
}

function pontoDoEvento(e: PointerEvent): [number, number] {
  const b = tela.value!.getBoundingClientRect()
  return [(e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height]
}

function aoPressionar(e: PointerEvent) {
  if (!renderer || !tela.value) return
  const alvo = renderer.bebidaEm(...pontoDoEvento(e))
  arrasto = { x: e.clientX, rot: renderer.rotacaoDe(alvo), alvo, moveu: false }
  tela.value?.setPointerCapture(e.pointerId)

  segurou = false
  clearTimeout(timerSegurar)
  if (props.interativa && !alvo && e.pointerType !== 'mouse') {
    const evento = { clientX: e.clientX, clientY: e.clientY, pointerType: e.pointerType } as unknown as PointerEvent
    timerSegurar = setTimeout(() => {
      if (!arrasto || arrasto.moveu) return
      const parte = renderer ? renderer.parteEm(...pontoDoEvento(evento)) : -1
      if (parte < 0) return
      segurou = true
      destacar(parte)
      mostrarRotulo(evento, parte)
    }, TEMPO_SEGURAR)
  }
}

function aoMover(e: PointerEvent) {
  if (!renderer) return
  if (arrasto) {
    const dx = e.clientX - arrasto.x
    if (Math.abs(dx) > 6 && !arrasto.moveu) {
      arrasto.moveu = true
      renderer.definirArrasto(true)
      clearTimeout(timerSegurar)
      if (segurou) { segurou = false; esconderRotulo(); destacar(-1) }
    }
    if (arrasto.moveu) renderer.girarPara(arrasto.rot + (dx / (tela.value?.clientWidth || 600)) * Math.PI, arrasto.alvo)
    return
  }
  if (props.interativa && e.pointerType === 'mouse') {
    const parte = parteDoEvento(e)
    destacar(parte)
    mostrarRotulo(e, parte)
  }
}

function aoSoltar(e: PointerEvent) {
  const a = arrasto
  const tinhaSegurado = segurou
  cancelar()
  if (tinhaSegurado) {
    esconderRotulo(900)
    destacar(-1)
    return
  }
  if (!a || a.moveu || a.alvo || !props.interativa) return
  const parte = parteDoEvento(e)
  if (parte >= 0) emit('selecionar', parte)
}

function cancelar() {
  clearTimeout(timerSegurar)
  segurou = false
  arrasto = null
  renderer?.definirArrasto(false)
}

function aoSair() {
  if (!arrasto) {
    destacar(-1)
    esconderRotulo()
  }
}
</script>

<style scoped>
.pizza {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.pizza__carregando {
  position: absolute;
  inset: 0;
  padding: 0;
  pointer-events: none;
}

.pizza__tela {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  touch-action: pan-y;
  cursor: grab;
}

.pizza__tela--clicavel {
  cursor: pointer;
}

.pizza__tela {
  -webkit-touch-callout: none;
  user-select: none;
  -webkit-user-select: none;
}

.pizza__rotulo {
  position: absolute;
  z-index: 2;
  max-width: 14rem;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  background: var(--fg);
  color: var(--bg);
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  translate: -50% -100%;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.rotulo-enter-active,
.rotulo-leave-active {
  transition: opacity 0.12s ease;
}

.rotulo-enter-from,
.rotulo-leave-to {
  opacity: 0;
}
</style>
