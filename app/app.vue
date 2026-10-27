<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const nomeDoSite = useNomeDoSite()
useHead({ titleTemplate: (titulo) => (titulo ? `${nomeDoSite.value} - ${titulo}` : nomeDoSite.value) })

</script>
