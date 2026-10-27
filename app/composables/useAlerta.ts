export const useAlerta = () => {
  const swal = async () => (await import('sweetalert')).default
  const toast = () => useNuxtApp().$toast

  return {
    sucesso: async (texto: string) => (await swal())({ title: 'Sucesso!', text: texto, icon: 'success', timer: 1500, buttons: [false] }),
    erro: (texto: string) => { toast()?.error(texto) },
    validar: (erros: Record<string, string>) => {
      const mensagens = Object.values(erros).filter(Boolean)
      mensagens.slice(0, 3).forEach((m) => toast()?.error(m))
      return mensagens.length === 0
    },
    semEntrega: async (nomes: string[], podeTrocar = true): Promise<'retirada' | 'trocar' | null> => {
      const lista = nomes.join(', ')
      const buttons: Record<string, unknown> = { retirada: { text: 'Retirar no balcão', value: 'retirada' } }
      if (podeTrocar) buttons.trocar = { text: 'Trocar bebidas', value: 'trocar' }
      return (await swal())({
        title: 'Não fazemos entrega desta bebida',
        text: `${lista} ${nomes.length > 1 ? 'só saem' : 'só sai'} na retirada no balcão, porque ${nomes.length > 1 ? 'podem derramar' : 'pode derramar'} no caminho. Você pode retirar o pedido aqui${podeTrocar ? ' ou trocar a bebida para pedir entrega' : ''}.`,
        icon: 'warning',
        buttons
      } as never) as unknown as 'retirada' | 'trocar' | null
    },
    confirmar: async (texto: string, botao = 'Sim, excluir'): Promise<boolean> =>
      Boolean(await (await swal())({ title: 'Tem certeza?', text: texto, icon: 'warning', buttons: ['Cancelar', botao], dangerMode: true }))
  }
}
