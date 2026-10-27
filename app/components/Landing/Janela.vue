<template>
  <figure class="janela" :class="{ 'janela--celular': celular }">
    <div v-if="!celular" class="janela__barra" aria-hidden="true">
      <span class="janela__ponto" /><span class="janela__ponto" /><span class="janela__ponto" />
      <span v-if="endereco" class="janela__endereco">{{ endereco }}</span>
    </div>
    <img class="janela__img janela__img--claro" :src="`/img/lp/${arquivo}-claro.webp?v=${VERSAO}`" :alt="alt" :width="largura" :height="altura" :loading="prioridade ? 'eager' : 'lazy'" :fetchpriority="prioridade ? 'high' : undefined" decoding="async">
    <img class="janela__img janela__img--escuro" :src="`/img/lp/${arquivo}-escuro.webp?v=${VERSAO}`" alt="" :width="largura" :height="altura" loading="lazy" fetchpriority="low" decoding="async">
    <figcaption v-if="legenda" class="janela__legenda">{{ legenda }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
const VERSAO = 6
withDefaults(defineProps<{
  arquivo: string
  alt: string
  largura?: number
  altura?: number
  endereco?: string
  celular?: boolean
  prioridade?: boolean
  legenda?: string
}>(), { largura: 1920, altura: 1200 })
</script>

<style scoped>
.janela {
  margin: 0;
  border-radius: 0.875rem;
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: 0 30px 60px -20px rgba(60, 35, 15, 0.35), 0 8px 18px rgba(60, 35, 15, 0.12);
  overflow: hidden;
}

.janela__barra {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 0.875rem;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
}

.janela__ponto {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background: var(--border-strong);
  opacity: 0.55;
}

.janela__endereco {
  flex: 1;
  max-width: 22rem;
  margin: 0 auto;
  padding: 0.1875rem 0.75rem;
  border-radius: 999px;
  background: var(--bg);
  font-size: 0.6875rem;
  color: var(--muted);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.janela__img {
  width: 100%;
  height: auto;
}

.janela__legenda {
  padding: 0.625rem 0.875rem;
  border-top: 1px solid var(--border);
  font-size: 0.75rem;
  color: var(--muted);
}

.janela--celular {
  position: relative;
  padding: 0.4375rem;
  border: 0;
  border-radius: 1.75rem;
  background: #0e0a07;
  box-shadow: 0 0 0 1px rgba(241, 233, 221, 0.22), 0 30px 50px -18px rgba(0, 0, 0, 0.55);
}


.janela--celular .janela__img {
  border-radius: 1.3rem;
}
</style>

<style>
.janela__img {
  display: block;
}

.janela__img--escuro {
  display: none;
}

html.dark .janela__img--claro {
  display: none;
}

html.dark .janela__img--escuro {
  display: block;
}
</style>
