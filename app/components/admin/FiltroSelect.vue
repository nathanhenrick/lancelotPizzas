<template>
  <div class="d-flex align-items-center gap-2">
    <label :for="id" class="small text-body-secondary text-nowrap mb-0">{{ rotulo }}</label>
    <select :id="id" class="form-select form-select-sm" :value="modelValue" @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <option value="">{{ todas }}</option>
      <option v-for="op in opcoes" :key="op.valor" :value="op.valor">{{ op.rotulo }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string
  rotulo: string
  opcoes: { valor: string, rotulo: string }[]
  todas?: string
}>(), { todas: 'Todos' })

const emit = defineEmits<{ 'update:modelValue': [valor: string] }>()

const id = useId()
</script>
