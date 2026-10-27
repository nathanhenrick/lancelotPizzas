import type { AxiosInstance } from 'axios'
import type { Borda } from '~/types/pizza'
import { criarCrud } from './crud'

export default (http: AxiosInstance) => criarCrud<Borda>(http, 'bordas')
