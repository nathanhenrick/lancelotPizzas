import { defineStore } from 'pinia'
import type { Usuario } from '~/types/pizza'

const COOKIE = 'montapizza_token'

const cookieToken = () =>
  useCookie<string | null>(COOKIE, { maxAge: 60 * 60 * 24 * 7, sameSite: 'lax', secure: !import.meta.dev })

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: null as Usuario | null,
    token: null as string | null
  }),

  getters: {
    autenticado: (s) => Boolean(s.token && s.usuario)
  },

  actions: {
    async login(email: string, senha: string) {
      const { $services } = useNuxtApp()
      const { data } = await $services.auth.login({ email, senha })
      await this.iniciar(data.token, data.user)
    },

    async iniciar(token: string, usuario: Usuario) {
      cookieToken().value = token
      this.token = token
      this.usuario = usuario
      await this.recarregarCardapio()
    },

    async restaurar(): Promise<boolean> {
      const cookie = cookieToken()
      if (!cookie.value) return false
      this.token = cookie.value
      try {
        const { $services } = useNuxtApp()
        this.usuario = (await $services.auth.me()).data
      } catch {
        cookie.value = null
        this.token = null
        this.usuario = null
        return false
      }
      await this.recarregarCardapio()
      return true
    },

    async logout() {
      const cookie = cookieToken()
      try {
        await useNuxtApp().$services.auth.logout()
      } catch {
      } finally {
        cookie.value = null
        this.token = null
        this.usuario = null
      }
      await this.recarregarCardapio()
    },

    limpar() {
      cookieToken().value = null
      this.token = null
      this.usuario = null
      void this.recarregarCardapio()
    },

    async recarregarCardapio() {
      await useCardapioStore().carregar()
    }
  }
})
