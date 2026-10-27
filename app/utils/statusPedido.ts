import type { ModoEntrega, StatusPedido } from '~/types/pizza'

export const STATUS_PEDIDO: Record<StatusPedido, { rotulo: string, classe: string }> = {
  novo: { rotulo: 'Novo', classe: 'text-bg-primary' },
  preparo: { rotulo: 'Em preparo', classe: 'text-bg-warning' },
  saiu: { rotulo: 'Saiu para entrega', classe: 'text-bg-info' },
  concluido: { rotulo: 'Concluído', classe: 'text-bg-success' },
  cancelado: { rotulo: 'Cancelado', classe: 'text-bg-secondary' }
}

export const ORDEM_STATUS: StatusPedido[] = ['novo', 'preparo', 'saiu', 'concluido']

export const rotuloStatus = (status: StatusPedido, modo: ModoEntrega): string =>
  status === 'saiu' && modo === 'retirada' ? 'Pronto para retirada' : STATUS_PEDIDO[status].rotulo

export const proximoStatus = (status: StatusPedido): StatusPedido | null => {
  const i = ORDEM_STATUS.indexOf(status)
  return i >= 0 && i < ORDEM_STATUS.length - 1 ? ORDEM_STATUS[i + 1]! : null
}
