import type { AxiosInstance } from 'axios'
import type { PoliticaPrivacidade } from '~/types/pizza'
import type { RespostaApi } from './crud'

export default (http: AxiosInstance) => ({
  get: async () => ({ data: (await http.get<RespostaApi<PoliticaPrivacidade>>('/politica-privacidade')).data.data }),
  salvar: async (payload: Partial<Pick<PoliticaPrivacidade, 'texto' | 'responsavel' | 'email'>>) =>
    ({ data: (await http.put<RespostaApi<PoliticaPrivacidade>>('/politica-privacidade', payload)).data.data })
})
