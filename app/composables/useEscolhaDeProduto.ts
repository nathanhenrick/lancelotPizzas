export async function abrirEscolhaDeProduto() {
  const pedido = usePedidoStore()
  const cardapio = useCardapioStore()

  if (!cardapio.esfirrasAtivas.length) {
    await navigateTo('/pizza', { replace: true })
  } else if (pedido.etapa === 'montar') {
    pedido.produto = null
  }
}
