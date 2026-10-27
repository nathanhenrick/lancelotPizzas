import type { AxiosInstance } from 'axios'
import type { TabelaPrecos } from '~/types/pizza'
import type { RespostaApi } from './crud'

export default (http: AxiosInstance) => ({
  get: async () => ({ data: (await http.get<RespostaApi<TabelaPrecos>>('/precos')).data.data }),
  update: async (payload: TabelaPrecos) => ({ data: (await http.put<RespostaApi<TabelaPrecos>>('/precos', payload)).data.data })
})
