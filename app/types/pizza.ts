export type TamanhoId = 'p' | 'm' | 'g'
export type FaixaId = 'trad' | 'esp' | 'prem'
export type TipoSabor = 'salgada' | 'doce'
export type Etapa = 'montar' | 'extras' | 'pedido' | 'enviado'
export type ModoEntrega = 'entrega' | 'retirada'

export type PrecoPorTamanho = Record<TamanhoId, number>

export interface Tamanho {
  id: TamanhoId
  nome: string
  info: string
  max_sabores: number
  escala: number
}

export interface Faixa extends PrecoPorTamanho {
  nome: string
}

export interface Sabor {
  id: number
  nome: string
  tipo: TipoSabor
  faixa: FaixaId
  descricao: string
  ingredientes: string[]
  adicionais: number[]
  ativo: boolean
}

export interface Borda extends PrecoPorTamanho {
  id: number
  nome: string
  cor: number | null
  ativo: boolean
}

export type ModeloBebida = 'garrafa_2l' | 'garrafa_1l' | 'garrafa_500' | 'lata' | 'jarra' | 'taca' | 'copo' | 'long_neck' | 'cerveja_1l' | 'cerveja_471'

export interface Bebida {
  id: number
  nome: string
  descricao: string
  preco: number
  modelo: ModeloBebida | null
  cor: number | null
  logo: string | null
  ativo: boolean
}

export interface Esfirra {
  id: number
  nome: string
  descricao: string
  preco: number
  tipo: TipoSabor
  ingredientes: string[]
  adicionais: number[]
  tamanhos: { nome: string, preco: number }[]
  cor: number | null
  ativo: boolean
}

export interface Adicional {
  id: number
  nome: string
  preco: number
  ativo: boolean
}

export interface AjusteParte {
  removidos: string[]
  adicionais: number[]
  observacao: string
}

export interface BebidaVisual {
  id?: number
  modelo: ModeloBebida
  cor: number
  nome?: string
  logo?: string | null
  quantidade?: number
}

export interface IngredienteVisual {
  nome: string
  qtd: number
  raio: number
}

export interface LinhaPedido {
  titulo: string
  detalhes: string[]
  preco: number
}

export interface EsfirraVisual {
  id: number
  cor: number
  quantidade: number
}

export interface PizzaVisual {
  qtd: number
  partes: (Sabor | null)[]
  escala: number
  corRecheio: number | null
  destaque: number
  bebidas?: BebidaVisual[]
  modo?: 'pizza' | 'esfirra'
  esfirras?: EsfirraVisual[]
}

export type RegraPreco = 'maior' | 'media'

export interface ConfigPizzaria {
  nome: string
  whatsapp: string
  regra_preco: RegraPreco
  razao_social: string
  cnpj: string
  descricao: string
  email: string
  telefone: string
  instagram: string
  facebook: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  horarios: HorarioDia[]
  area_entrega: string
  taxa_entrega: string
  tempo_entrega: string
  tempo_retirada: string
  formas_pagamento: string
  atualizado_em?: string
}

export interface HorarioDia {
  dia: string
  fechado: boolean
  abre: string | null
  fecha: string | null
}

export interface TabelaPrecos {
  tamanhos: Tamanho[]
  faixas: Record<FaixaId, Faixa>
}

export type StatusPedido = 'novo' | 'preparo' | 'saiu' | 'concluido' | 'cancelado'

export interface Pedido {
  id: number
  criado_em: string
  status: StatusPedido
  cliente: string
  modo: ModoEntrega
  tamanho: string
  sabores: string[]
  linhas: LinhaPedido[]
  total: number
}

export interface NovoPedido {
  cliente: string
  modo: ModoEntrega
  tamanho?: TamanhoId
  sabores: number[]
  borda: number | null
  bebidas: { id: number, quantidade: number }[]
  esfirras: { id: number, tamanho: string, quantidade: number, ajuste?: AjusteParte }[]
  ajustes: AjusteParte[]
}

export interface ResumoDashboard {
  pedidos_hoje: number
  vendas_hoje: number
  aguardando: number
  ticket_medio: number
  ultimos_pedidos: Pedido[]
  sabores_mais_pedidos: { nome: string, qtd: number }[]
}

export type StatusUsuario = 'ATIVO' | 'INATIVO'

export type PapelUsuario = 'dono' | 'atendente'

export interface Usuario {
  id: number
  nome: string
  email: string
  status: StatusUsuario
  papel: PapelUsuario
  criado_em: string
}





export interface MetaPaginacao {
  pagina: number
  por_pagina: number
  total: number
  ultima_pagina: number
}


export interface PoliticaPrivacidade {
  texto: string
  responsavel: string
  email: string
  atualizado_em: string | null
}
