import type { AxiosInstance } from 'axios'

export interface RespostaApi<T> {
  status: 'Success' | 'Error'
  message: string
  data: T
  meta?: { pagina: number, por_pagina: number, total: number, ultima_pagina: number }
}

export function criarCrud<T extends { id: number }, P = Omit<T, 'id'>>(http: AxiosInstance, recurso: string) {
  return {
    getAll: async () => ({ data: (await http.get<RespostaApi<T[]>>(`/${recurso}`)).data.data }),
    getById: async (id: number) => ({ data: (await http.get<RespostaApi<T>>(`/${recurso}/${id}`)).data.data }),
    save: async (payload: P) => ({ data: (await http.post<RespostaApi<T>>(`/${recurso}`, payload)).data.data }),
    update: async ({ id, ...payload }: Partial<P> & { id: number }) =>
      ({ data: (await http.put<RespostaApi<T>>(`/${recurso}/${id}`, payload)).data.data }),
    delete: async (id: number) => {
      await http.delete(`/${recurso}/${id}`)
      return { data: null }
    }
  }
}
