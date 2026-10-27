<template>
  <div class="input-group">
    <span class="input-group-text">R$</span>
    <input
      :id="id"
      v-model="texto"
      v-mask-decimal.br="2"
      type="text"
      class="form-control"
      inputmode="numeric"
      autocomplete="off"
      :aria-label="rotulo"
    >
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: number, id?: string, rotulo?: string }>()

const emit = defineEmits<{ 'update:modelValue': [valor: number] }>()

const formatar = (valor: number) => (valor || 0).toFixed(2).replace('.', ',')
const lerTexto = (txt: string) => Number(txt.replace(/\./g, '').replace(',', '.')) || 0

const texto = ref(formatar(props.modelValue))

watch(texto, (novo) => {
  const valor = lerTexto(novo)
  if (valor !== props.modelValue) emit('update:modelValue', valor)
})

watch(() => props.modelValue, (valor) => {
  if (valor !== lerTexto(texto.value)) texto.value = formatar(valor)
})
</script>
