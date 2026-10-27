<template>
  <a :href="href" class="logo" :class="[`logo--${tom}`, `logo--${formato}`]" :aria-label="rotulo" :title="rotulo">
    <img v-if="tom !== 'clara'" :src="arquivos.escura" alt="" class="logo__img logo__img--escura" :width="tamanho.w" :height="tamanho.h" loading="lazy" decoding="async">
    <img v-if="tom !== 'escura'" :src="arquivos.clara" alt="" class="logo__img logo__img--clara" :width="tamanho.w" :height="tamanho.h" loading="lazy" decoding="async">
  </a>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  tom?: 'auto' | 'clara' | 'escura'
  formato?: 'quadrada' | 'horizontal' | 'simbolo' | 'texto'
  rotulo?: string
  href?: string
}>(), {
  href: '/',
  tom: 'auto',
  formato: 'quadrada',
  rotulo: 'Lancelot Pizzas, página inicial'
})

const ARQUIVOS = {
  quadrada: { clara: '/logo.svg', escura: '/logo-escura.svg', w: 812, h: 640 },
  horizontal: { clara: '/logo-horizontal.svg', escura: '/logo-horizontal-escura.svg', w: 1162, h: 435 },
  simbolo: { clara: '/logo-simbolo.svg', escura: '/logo-simbolo-escura.svg', w: 286, h: 435 },
  texto: { clara: '/logo-texto.svg', escura: '/logo-texto-escura.svg', w: 812, h: 189 }
}

const arquivos = computed(() => ARQUIVOS[props.formato])
const tamanho = computed(() => ({ w: arquivos.value.w, h: arquivos.value.h }))
</script>

<style scoped>
.logo {
  display: inline-flex;
  height: 3rem;
  flex: none;
  border-radius: 0.5rem;
}

.logo--quadrada {
  aspect-ratio: 812 / 640;
}

.logo--horizontal {
  aspect-ratio: 1162 / 435;
}

.logo--simbolo {
  aspect-ratio: 286 / 435;
}

.logo--texto {
  aspect-ratio: 812 / 189;
}

.logo:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 3px;
}

.logo__img {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

<style>
.logo--auto .logo__img--clara {
  display: none;
}

html.dark .logo--auto .logo__img--clara {
  display: block;
}

html.dark .logo--auto .logo__img--escura {
  display: none;
}
</style>
