import type { AxiosInstance } from 'axios'
import type { ConfigPizzaria } from '~/types/pizza'
import type { RespostaApi } from './crud'

export default (http: AxiosInstance) => ({
  get: async () => ({ data: (await http.get<RespostaApi<ConfigPizzaria>>('/configuracoes')).data.data }),
  update: async (payload: Partial<ConfigPizzaria>) =>
    ({ data: (await http.put<RespostaApi<ConfigPizzaria>>('/configuracoes', payload)).data.data })
})
