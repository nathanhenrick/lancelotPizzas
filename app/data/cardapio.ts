import type { ConfigPizzaria, Faixa, FaixaId, Tamanho } from '~/types/pizza'

export const CONFIG: ConfigPizzaria = {
  nome: 'Pizzaria',
  whatsapp: '',
  regra_preco: 'maior',
  razao_social: '',
  cnpj: '',
  descricao: '',
  email: '',
  telefone: '',
  instagram: '',
  facebook: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  horarios: [],
  area_entrega: '',
  taxa_entrega: '',
  tempo_entrega: '',
  tempo_retirada: '',
  formas_pagamento: ''
}

export const TAMANHOS: Tamanho[] = [
  { id: 'p', nome: 'Broto', info: '25 cm · 4 fatias', max_sabores: 2, escala: 0.78 },
  { id: 'm', nome: 'Média', info: '30 cm · 6 fatias', max_sabores: 3, escala: 0.89 },
  { id: 'g', nome: 'Grande', info: '35 cm · 8 fatias', max_sabores: 4, escala: 1 }
]

export const FAIXAS: Record<FaixaId, Faixa> = {
  trad: { nome: 'Tradicional', p: 0, m: 0, g: 0 },
  esp: { nome: 'Especial', p: 0, m: 0, g: 0 },
  prem: { nome: 'Premium', p: 0, m: 0, g: 0 }
}

export const FRACOES = ['', 'Inteira', '1/2', '1/3', '1/4']
