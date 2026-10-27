import type { AxiosInstance } from 'axios'
import type { Usuario } from '~/types/pizza'
import type { RespostaApi } from './crud'

export default (http: AxiosInstance) => ({
  login: async (payload: { email: string, senha: string }) =>
    ({ data: (await http.post<RespostaApi<{ user: Usuario, token: string }>>('/auth/login', payload)).data.data }),
  me: async () => ({ data: (await http.get<RespostaApi<Usuario>>('/auth/me')).data.data }),
  logout: async () => {
    await http.post('/auth/logout')
    return { data: null }
  }
})
