<template>
  <main id="conteudo" tabindex="-1" class="priv">
    <div class="priv__miolo">
      <h1 class="priv__titulo">Política de privacidade</h1>
      <template v-if="paragrafos.length">
        <p v-for="(par, i) in paragrafos" :key="i" class="priv__texto">{{ par }}</p>
        <p v-if="politica?.atualizado_em" class="priv__legal">Atualizado em {{ politica.atualizado_em }}</p>
      </template>
      <div v-else-if="error" class="priv__texto" role="alert">
        <p>Não foi possível carregar a política de privacidade agora. Confira a sua conexão e tente de novo.</p>
        <button type="button" class="priv__tentar" @click="() => refresh()">Tentar de novo</button>
      </div>
      <p v-else class="priv__texto">A política de privacidade ainda não foi publicada.</p>
      <p v-if="politica?.email" class="priv__texto">
        Contato de privacidade{{ politica.responsavel ? ` (${politica.responsavel})` : '' }}:
        <a :href="`mailto:${politica.email}`">{{ politica.email }}</a>
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const { $services } = useNuxtApp()
const { data: politica, error, refresh } = await useAsyncData('politica-privacidade', async () => (await $services.politica.get()).data)
const paragrafos = computed(() => (politica.value?.texto ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean))

usePaginaSeo({
  titulo: 'Política de privacidade',
  descricao: 'Como a pizzaria trata os dados pessoais, conforme a Lei Geral de Proteção de Dados (LGPD).',
  caminho: '/privacidade'
})
</script>

<style scoped>
.priv {
  flex: 1;
  padding: 3rem 1rem 4rem;
}

.priv:focus {
  outline: none;
}

.priv__miolo {
  max-width: 46rem;
  margin: 0 auto;
  display: grid;
  gap: 1rem;
}

.priv__titulo {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  letter-spacing: -0.015em;
}

.priv__texto {
  margin: 0;
  line-height: 1.7;
  white-space: pre-line;
  color: var(--fg);
}

.priv__texto a {
  color: var(--accent-text);
  font-weight: 600;
}

.priv__tentar {
  justify-self: start;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-strong);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--fg);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.priv__legal {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--muted);
}
</style>
