<template>
  <fieldset class="dividir">
    <legend class="dividir__legenda">Dividir em</legend>
    <div class="dividir__opcoes">
      <label
        v-for="n in OPCOES"
        :key="n"
        class="dividir__op"
        :class="{ 'dividir__op--ativa': n === pedido.qtdSabores, 'dividir__op--bloqueada': n > max }"
      >
        <input
          class="sr-only"
          type="radio"
          name="qtd-sabores"
          :value="n"
          :checked="n === pedido.qtdSabores"
          :disabled="n > max"
          @change="escolher(n)"
        >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="9" />
          <path :d="CORTES[n - 1]" />
        </svg>
        <span aria-hidden="true">{{ n }}</span>
        <span class="sr-only">{{ n === 1 ? '1 sabor' : `${n} sabores` }}{{ n > max ? ' (indisponível neste tamanho)' : '' }}</span>
      </label>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
const OPCOES = [1, 2, 3, 4]
const CORTES = ['', 'M11 2V20', 'M11 11V2M11 11L18.8 15.5M11 11L3.2 15.5', 'M11 2V20M2 11H20']

const pedido = usePedidoStore()
const { anunciar } = useAnuncio()

const max = computed(() => pedido.tamanhoAtual.max_sabores)

function escolher(n: number) {
  pedido.definirQtdSabores(n)
  anunciar(n === 1 ? 'Pizza inteira, um sabor.' : `Pizza dividida em ${n} partes iguais.`)
}
</script>

<style scoped>
.dividir {
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dividir__legenda {
  float: left;
  padding: 0;
  font-size: 0.875rem;
  color: var(--muted);
  white-space: nowrap;
}

.dividir__opcoes {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.375rem;
}

.dividir__op {
  min-height: 2.875rem;
  border-radius: var(--radius);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.dividir__op--ativa {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-fg);
}

.dividir__op--bloqueada {
  opacity: 0.4;
  cursor: not-allowed;
}

.dividir__op:has(input:focus-visible) {
  outline: 3px solid var(--fg);
  outline-offset: 2px;
}
</style>
