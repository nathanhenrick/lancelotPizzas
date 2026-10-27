export const useRestricaoEntrega = (podeTrocar = true) => {
  const pedido = usePedidoStore()
  const alerta = useAlerta()

  async function verificar(): Promise<boolean> {
    if (pedido.modo !== 'entrega' || !pedido.bebidasSemEntrega.length) return true
    const escolha = await alerta.semEntrega(pedido.bebidasSemEntrega, podeTrocar)
    if (escolha === 'trocar') {
      pedido.modo = null
      pedido.irPara('extras')
    } else {
      pedido.modo = 'retirada'
    }
    return false
  }

  watch(() => pedido.modo, () => { void verificar() })

  return { verificar }
}
