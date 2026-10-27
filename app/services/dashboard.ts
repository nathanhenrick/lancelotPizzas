import type { AxiosInstance } from 'axios'
import type { ResumoDashboard } from '~/types/pizza'
import type { RespostaApi } from './crud'

export default (http: AxiosInstance) => ({
  get: async () => ({ data: (await http.get<RespostaApi<ResumoDashboard>>('/dashboard')).data.data })
})
