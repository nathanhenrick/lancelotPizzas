<template>
  <div class="lista">
    <div class="lista__cab">
      <span id="partes-rotulo" class="lista__rotulo">Sabores</span>
      <BaseButton v-if="pedido.preenchidas" variante="texto" class="lista__limpar" @click="limpar">
        <BaseIcon nome="fechar" :tamanho="14" /> Limpar sabores
      </BaseButton>
    </div>
    <ul class="partes" aria-labelledby="partes-rotulo">
      <li v-for="(sabor, i) in pedido.saboresDasPartes" :key="i">
        <PartChip
          :indice="i"
          :total="pedido.qtdSabores"
          :fracao="pedido.fracao"
          :sabor="sabor"
          :realce="pedido.parteDestaque === i"
          :ajustado="temAjuste(pedido.ajustes[i])"
          @click="pedido.abrirSeletor(i)"
          @mouseenter="pedido.parteDestaque = i"
          @mouseleave="pedido.parteDestaque = -1"
          @focus="pedido.parteDestaque = i"
          @blur="pedido.parteDestaque = -1"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const pedido = usePedidoStore()
const { anunciar } = useAnuncio()

function limpar() {
  pedido.limparSabores()
  anunciar(`Sabores removidos. Escolha de novo o sabor ${pedido.qtdSabores === 1 ? 'da pizza' : 'de cada parte'}.`)
}
</script>

<style scoped>
.lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lista__cab {
  min-height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.lista__rotulo {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--muted);
}

.lista .lista__limpar {
  min-height: 2.25rem;
  padding: 0 0.625rem;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent-text);
}

.lista .lista__limpar:hover {
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}

.partes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.partes li {
  display: grid;
}

.partes li:only-child {
  grid-column: 1 / -1;
}
</style>
