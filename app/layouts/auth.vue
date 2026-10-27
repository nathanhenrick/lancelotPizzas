<template>
  <main class="auth-shell">
    <slot />
  </main>
</template>

<script setup lang="ts">
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '~/assets/css/admin.css'

useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const colorMode = useColorMode()

watchEffect(() => {
  if (import.meta.client) document.documentElement.setAttribute('data-bs-theme', colorMode.value === 'dark' ? 'dark' : 'light')
})
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: var(--bs-secondary-bg);
}
</style>
