<template>
  <header class="header_template d-flex flex-wrap justify-content-between align-items-center gap-3">
    <div>
      <h1><slot /></h1>
      <p v-if="$slots.descricao" class="text-body-secondary mb-0 mt-1"><slot name="descricao" /></p>
    </div>
    <slot name="acoes" />
  </header>
</template>

<style>
.header_template {
  margin-bottom: 2.5rem;
}

.header_template h1 {
  font-weight: 700;
  font-family: var(--font-display);
  font-size: 2rem;
  margin: 0;
}
</style>
