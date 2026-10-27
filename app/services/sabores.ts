import type { AxiosInstance } from 'axios'
import type { Sabor } from '~/types/pizza'
import { criarCrud } from './crud'

export default (http: AxiosInstance) => criarCrud<Sabor>(http, 'sabores')
