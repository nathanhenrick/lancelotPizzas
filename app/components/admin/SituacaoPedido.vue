<template>
  <div ref="raiz" class="btn-group btn-group-sm" @keydown.esc="fechar(true)">
    <button v-if="proximo" type="button" class="btn btn-outline-primary" @click="emit('mudar', proximo)">
      {{ rotuloStatus(proximo, modo) }}
    </button>
    <button
      ref="botao"
      type="button"
      class="btn btn-outline-primary"
      :aria-label="`Outras situações do pedido ${pedido}`"
      title="Outras situações"
      aria-haspopup="menu"
      :aria-expanded="aberto"
      @click="aberto ? fechar() : abrir()"
    >
      <i class="bi bi-chevron-down" aria-hidden="true" />
    </button>
  </div>

  <Teleport to="body">
    <ul v-if="aberto" ref="menu" class="dropdown-menu show situacao-menu" role="menu" :style="posicao" :data-bs-theme="tema" @keydown.down.prevent="mover(1)" @keydown.up.prevent="mover(-1)" @keydown.esc="fechar(true)">
      <li v-for="(info, chave) in STATUS_PEDIDO" :key="chave" role="none">
        <button
          type="button"
          class="dropdown-item d-flex align-items-center gap-2"
          :class="{ active: chave === status }"
          role="menuitemradio"
          :aria-checked="chave === status"
          @click="escolher(chave)"
        >
          <span class="badge rounded-pill" :class="info.classe">&nbsp;</span>
          <span class="flex-grow-1">{{ rotuloStatus(chave, modo) }}</span>
          <i v-if="chave === status" class="bi bi-check2" aria-hidden="true" />
        </button>
      </li>
    </ul>
  </Teleport>
</template>

<script setup lang="ts">
import type { ModoEntrega, StatusPedido } from '~/types/pizza'

const props = defineProps<{ pedido: number, status: StatusPedido, modo: ModoEntrega }>()
const emit = defineEmits<{ mudar: [status: StatusPedido] }>()

const proximo = computed(() => proximoStatus(props.status))

const colorMode = useColorMode()
const tema = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'))

const raiz = ref<HTMLElement>()
const botao = ref<HTMLButtonElement>()
const menu = ref<HTMLUListElement>()
const aberto = ref(false)
const posicao = ref<Record<string, string>>({})

const itens = () => [...(menu.value?.querySelectorAll<HTMLButtonElement>('.dropdown-item') ?? [])]

async function abrir() {
  const r = raiz.value!.getBoundingClientRect()
  posicao.value = { position: 'fixed', top: `${r.bottom + 4}px`, right: `${window.innerWidth - r.right}px`, left: 'auto', zIndex: '1060' }
  aberto.value = true
  await nextTick()
  const m = menu.value!.getBoundingClientRect()
  if (m.bottom > window.innerHeight - 8) posicao.value = { ...posicao.value, top: `${r.top - m.height - 4}px` }
  itens().find((b) => b.classList.contains('active'))?.focus()
}

function fechar(voltarFoco = false) {
  aberto.value = false
  if (voltarFoco) botao.value?.focus()
}

function escolher(status: StatusPedido) {
  fechar(true)
  if (status !== props.status) emit('mudar', status)
}

function mover(passo: number) {
  const lista = itens()
  const i = lista.indexOf(document.activeElement as HTMLButtonElement)
  lista[(i + passo + lista.length) % lista.length]?.focus()
}

function foraDoMenu(e: Event) {
  const alvo = e.target as Node
  if (aberto.value && !menu.value?.contains(alvo) && !raiz.value?.contains(alvo)) fechar()
}
const aoRolar = () => { if (aberto.value) fechar() }
onMounted(() => {
  document.addEventListener('pointerdown', foraDoMenu)
  window.addEventListener('scroll', aoRolar, true)
  window.addEventListener('resize', aoRolar)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', foraDoMenu)
  window.removeEventListener('scroll', aoRolar, true)
  window.removeEventListener('resize', aoRolar)
})
</script>

<style scoped>
.situacao-menu {
  min-width: 13rem;
}

.situacao-menu .badge {
  width: 0.75rem;
  height: 0.75rem;
  padding: 0;
}
</style>
