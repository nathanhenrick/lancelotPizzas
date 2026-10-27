<template>
  <header class="topo">
    <div class="topo__marca">
      <AppLogo formato="texto" :href="inicio" class="topo__logo topo__logo--texto" :rotulo="`${cardapio.config.nome}, página inicial`" />
      <AppLogo formato="horizontal" :href="inicio" class="topo__logo topo__logo--completo" :rotulo="`${cardapio.config.nome}, página inicial`" />
    </div>
    <StepIndicator :etapa="pedido.etapa" />
    <NuxtLink to="/sobre" class="topo__sobre" aria-label="Sobre a pizzaria" title="Sobre a pizzaria">
      <BaseIcon nome="info" />
    </NuxtLink>
    <ThemeToggle />
  </header>
</template>

<script setup lang="ts">
const pedido = usePedidoStore()
const cardapio = useCardapioStore()
const inicio = '/loja'
</script>

<style scoped>
.topo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  padding-top: max(0.5rem, env(safe-area-inset-top));
  border-bottom: 1px solid var(--border);
}

.topo__sobre {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius);
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  color: var(--fg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.topo__marca {
  display: inline-flex;
  margin-right: auto;
  border-radius: var(--radius);
}

.topo__marca .topo__logo {
  height: 1.75rem;
}

.topo__marca .topo__logo--completo {
  display: none;
}

@media (max-width: 410px) {
  .topo {
    gap: 0.375rem;
    padding-inline: 0.5rem;
  }

  .topo__marca .topo__logo {
    height: 1.5rem;
  }
}

@media (min-width: 900px) {
  .topo {
    padding: 0.625rem 1.5rem;
  }

  .topo__marca .topo__logo {
    height: 2.75rem;
  }

  .topo__marca .topo__logo--texto {
    display: none;
  }

  .topo__marca .topo__logo--completo {
    display: inline-flex;
  }
}
</style>
