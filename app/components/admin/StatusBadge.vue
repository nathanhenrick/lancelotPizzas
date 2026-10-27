<template>
  <span class="badge" :class="STATUS_PEDIDO[status].classe">{{ rotuloStatus(status, modo) }}</span>
</template>

<script setup lang="ts">
import type { ModoEntrega, StatusPedido } from '~/types/pizza'

defineProps<{ status: StatusPedido, modo: ModoEntrega }>()
</script>
