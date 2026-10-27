<template>
  <div class="app">
    <SkipLink alvo="#conteudo">Pular para o conteúdo</SkipLink>
    <AppHeader />
    <slot />
    <LiveAnnouncer />
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  height: 100dvh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}
</style>
