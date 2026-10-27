import type { AxiosInstance } from 'axios'
import type { Esfirra } from '~/types/pizza'
import { criarCrud } from './crud'

export default (http: AxiosInstance) => criarCrud<Esfirra>(http, 'esfirras')
