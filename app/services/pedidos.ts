import type { AxiosInstance } from 'axios'
import type { NovoPedido, Pedido, StatusPedido } from '~/types/pizza'
import type { RespostaApi } from './crud'

const POR_PAGINA = 500
const PAGINAS_NO_MAXIMO = 20

export default (http: AxiosInstance) => ({
  getAll: async () => {
    const lista: Pedido[] = []
    for (let pagina = 1; pagina <= PAGINAS_NO_MAXIMO; pagina++) {
      const { data } = await http.get<RespostaApi<Pedido[]>>('/admin/pedidos', { params: { pagina, por_pagina: POR_PAGINA } })
      lista.push(...data.data)
      if (pagina >= (data.meta?.ultima_pagina ?? 1)) break
    }
    return { data: lista }
  },
  getById: async (id: number) => ({ data: (await http.get<RespostaApi<Pedido>>(`/pedidos/${id}`)).data.data }),
  registrar: async (payload: NovoPedido) => ({ data: (await http.post<RespostaApi<Pedido>>('/pedidos', payload)).data.data }),
  atualizarStatus: async (id: number, status: StatusPedido) =>
    ({ data: (await http.put<RespostaApi<Pedido>>(`/pedidos/${id}`, { status })).data.data })
})
