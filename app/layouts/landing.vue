<template>
  <div class="landing">
    <SkipLink alvo="#conteudo">Pular para o conteúdo</SkipLink>
    <LandingCabecalho />
    <slot />
    <LandingRodape />
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/landing-container.css'
</script>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
