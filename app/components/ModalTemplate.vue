<template>
  <Teleport v-if="open" to="body">
    <div class="modal-overlay" :data-bs-theme="tema" @click.self="close">
      <div
        ref="caixa"
        class="modal-content"
        :class="{ 'modal-content--largo': largo }"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="idTitulo"
        tabindex="-1"
        @keydown.esc.stop="close"
        @keydown.tab="prenderFoco"
      >
        <header class="modal-header">
          <div :id="idTitulo" class="flex-grow-1"><slot name="header" /></div>
          <button type="button" class="close-btn" aria-label="Fechar" @click="close">
            <i class="bi bi-x" aria-hidden="true" />
          </button>
        </header>

        <main class="modal-body">
          <slot name="content" />
        </main>

        <footer v-if="$slots.buttons" class="modal-footer">
          <slot name="buttons" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  largo?: boolean
}>()

const emit = defineEmits<{ close: [] }>()
const close = () => emit('close')

const colorMode = useColorMode()
const tema = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'))

const idTitulo = useId()
const caixa = ref<HTMLElement>()
let focoAnterior: HTMLElement | null = null

watch(() => props.open, async (aberto) => {
  if (aberto) {
    focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null
    await nextTick()
    const primeiro = caixa.value?.querySelector<HTMLElement>('input, select, textarea')
    ;(primeiro ?? caixa.value)?.focus()
  } else if (focoAnterior?.isConnected) {
    focoAnterior.focus()
  }
})

function prenderFoco(e: KeyboardEvent) {
  const focaveis = caixa.value?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select, textarea, a[href]')
  if (!focaveis?.length) return
  const primeiro = focaveis[0]!
  const ultimo = focaveis[focaveis.length - 1]!
  if (e.shiftKey && document.activeElement === primeiro) {
    e.preventDefault()
    ultimo.focus()
  } else if (!e.shiftKey && document.activeElement === ultimo) {
    e.preventDefault()
    primeiro.focus()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  color: var(--bs-body-color);
}

.modal-content {
  background: var(--bs-body-bg);
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-content--largo {
  max-width: 900px;
}

.modal-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.modal-body {
  padding: 1rem;
  max-height: calc(100vh - 200px);
  max-height: calc(100dvh - 200px);
  overflow-y: auto;
}

.modal-footer {
  padding: 1rem;
}

.close-btn {
  border: none;
  background-color: transparent;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--bs-secondary-color);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: var(--bs-secondary-bg);
  color: var(--bs-body-color);
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 94vw;
    width: 94vw;
    padding: 0.5rem;
  }

  .modal-body {
    max-height: calc(100dvh - 160px);
  }
}
</style>
