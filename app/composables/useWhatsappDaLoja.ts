export function useWhatsappDaLoja() {
  const cardapio = useCardapioStore()
  const reserva = String(useRuntimeConfig().public.whatsapp || '')

  return computed(() => cardapio.config.whatsapp || reserva)
}
