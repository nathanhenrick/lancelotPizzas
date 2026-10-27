import type { AxiosInstance } from 'axios'
import type { Adicional } from '~/types/pizza'
import { criarCrud } from './crud'

export default (http: AxiosInstance) => criarCrud<Adicional>(http, 'adicionais')
