<template>
  <div class="landing d-flex flex-column min-vh-100">
    <SkipLink alvo="#conteudo">Pular para o conteúdo</SkipLink>
    <LandingCabecalho />
    <slot />
    <LandingRodape />
  </div>
</template>

<script setup lang="ts">
import 'bootstrap/dist/css/bootstrap.min.css'
import '~/assets/css/landing.css'

const colorMode = useColorMode()

watchEffect(() => {
  if (import.meta.client) document.documentElement.setAttribute('data-bs-theme', colorMode.value === 'dark' ? 'dark' : 'light')
})
</script>
