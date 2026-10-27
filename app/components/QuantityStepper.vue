<template>
  <div class="qtd" role="group" :aria-label="`Quantidade de ${rotulo}`">
    <button type="button" class="qtd__btn" :disabled="modelValue <= min" :aria-label="`Diminuir ${rotulo}`" @click="emit('update:modelValue', modelValue - 1)">
      <BaseIcon nome="menos" :tamanho="18" />
    </button>
    <output class="qtd__valor" aria-live="polite">{{ modelValue }}</output>
    <button type="button" class="qtd__btn" :disabled="modelValue >= max" :aria-label="`Aumentar ${rotulo}`" @click="emit('update:modelValue', modelValue + 1)">
      <BaseIcon nome="mais" :tamanho="18" />
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ modelValue: number, rotulo: string, min?: number, max?: number }>(), { min: 0, max: 20 })

const emit = defineEmits<{ 'update:modelValue': [valor: number] }>()
</script>

<style scoped>
.qtd {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.qtd__btn {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.625rem;
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.qtd__btn:disabled {
  opacity: 0.4;
}

.qtd__valor {
  min-width: 1.75rem;
  text-align: center;
  font-weight: 600;
}
</style>
