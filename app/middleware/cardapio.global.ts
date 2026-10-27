const SEM_CARDAPIO = ['/', '/privacidade']

export default defineNuxtRouteMiddleware(async (to) => {
  if (SEM_CARDAPIO.includes(to.path)) return

  const cardapio = useCardapioStore()
  if (cardapio.carregado) return
  await cardapio.carregar()
})
