import axios from 'axios'
import { criarServices } from '~/services'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const httpClient = axios.create({
    baseURL: (import.meta.server && config.apiBaseUrlServidor) || config.public.apiBaseUrl,
    headers: { Accept: 'application/json' }
  })

  const auth = useAuthStore()

  httpClient.interceptors.request.use((config) => {
    if (auth.token) config.headers.Authorization = `Bearer ${auth.token}`
    return config
  })

  httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const rotaAuth = String(error.config?.url ?? '').includes('/auth/')
      if (error.response?.status === 401 && !rotaAuth && auth.token) {
        auth.limpar()
        nuxtApp.runWithContext(() => navigateTo('/login'))
      }
      return Promise.reject(error)
    }
  )

  return {
    provide: {
      services: criarServices(httpClient)
    }
  }
})
