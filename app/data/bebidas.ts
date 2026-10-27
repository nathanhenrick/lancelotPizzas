import type { ModeloBebida } from '~/types/pizza'

interface InfoModelo {
  nome: string
  altura: number
  diametro: number
}

export const MODELOS_BEBIDA: Record<ModeloBebida, InfoModelo> = {
  garrafa_2l: { nome: 'Garrafa PET 2 L', altura: 33, diametro: 10.5 },
  garrafa_1l: { nome: 'Garrafa PET 1 L', altura: 27, diametro: 8.5 },
  garrafa_500: { nome: 'Garrafa 500 ml', altura: 21, diametro: 6.5 },
  lata: { nome: 'Lata 350 ml', altura: 12.2, diametro: 6.6 },
  jarra: { nome: 'Jarra 1 L', altura: 22, diametro: 11.2 },
  taca: { nome: 'Taça', altura: 20, diametro: 8 },
  copo: { nome: 'Copo', altura: 12, diametro: 7.5 },
  long_neck: { nome: 'Long neck 330 ml', altura: 23, diametro: 6 },
  cerveja_471: { nome: 'Garrafa de cerveja 471 ml', altura: 24, diametro: 6.8 },
  cerveja_1l: { nome: 'Garrafa de cerveja 1 L (litrão)', altura: 30, diametro: 8.4 }
}

export const ORDEM_NA_CENA: ModeloBebida[] = ['garrafa_2l', 'cerveja_1l', 'garrafa_1l', 'jarra', 'garrafa_500', 'cerveja_471', 'long_neck', 'taca', 'copo', 'lata']

export const CORES_BEBIDA = [
  { nome: 'Cola', cor: 0x3b1a0e },
  { nome: 'Guaraná', cor: 0xa85a1e },
  { nome: 'Laranja', cor: 0xf28c28 },
  { nome: 'Uva', cor: 0x5b1e4a },
  { nome: 'Limão', cor: 0xc6d94a },
  { nome: 'Água', cor: 0xd9eef7 },
  { nome: 'Cerveja', cor: 0xe0a526 },
  { nome: 'Vidro âmbar', cor: 0x7a3d0c },
  { nome: 'Vidro verde', cor: 0x2f6b2f },
  { nome: 'Vinho tinto', cor: 0x5e0b1c },
  { nome: 'Vinho branco', cor: 0xe8d77a }
]

export const COR_BEBIDA_PADRAO = 0x3b1a0e
