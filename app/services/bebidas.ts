import type { AxiosInstance } from 'axios'
import type { Bebida } from '~/types/pizza'
import { criarCrud } from './crud'

export default (http: AxiosInstance) => criarCrud<Bebida>(http, 'bebidas')
