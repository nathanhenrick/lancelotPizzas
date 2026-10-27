import type { AxiosInstance } from 'axios'
import type { PapelUsuario, StatusUsuario, Usuario } from '~/types/pizza'
import { criarCrud } from './crud'

interface UsuarioPayload {
  nome: string
  email: string
  senha?: string
  status: StatusUsuario
  papel: PapelUsuario
}

export default (http: AxiosInstance) => criarCrud<Usuario, UsuarioPayload>(http, 'users')
