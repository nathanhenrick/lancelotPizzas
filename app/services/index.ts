import type { AxiosInstance } from 'axios'
import auth from './auth'
import sabores from './sabores'
import bordas from './bordas'
import bebidas from './bebidas'
import esfirras from './esfirras'
import adicionais from './adicionais'
import precos from './precos'
import config from './config'
import pedidos from './pedidos'
import dashboard from './dashboard'
import usuarios from './usuarios'
import politica from './politica'

export const criarServices = (http: AxiosInstance) => ({
  auth: auth(http),
  sabores: sabores(http),
  bordas: bordas(http),
  bebidas: bebidas(http),
  esfirras: esfirras(http),
  adicionais: adicionais(http),
  precos: precos(http),
  config: config(http),
  pedidos: pedidos(http),
  dashboard: dashboard(http),
  usuarios: usuarios(http),
  politica: politica(http)
})

export type Services = ReturnType<typeof criarServices>
