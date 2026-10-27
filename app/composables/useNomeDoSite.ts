export const NOME_DA_MARCA = 'Lancelot Pizzas'

export function useNomeDoSite(): ComputedRef<string> {
  const cardapio = useCardapioStore()

  return computed(() => cardapio.config.nome?.trim() || NOME_DA_MARCA)
}
