import type { IngredienteVisual } from '~/types/pizza'

export const INGREDIENTES: Record<string, IngredienteVisual> = {
  chocolate: { nome: 'Chocolate', qtd: 14, raio: 62 },
  mussarela: { nome: 'Mussarela', qtd: 12, raio: 58 },
  catupiry: { nome: 'Catupiry', qtd: 0, raio: 0 },
  tomate: { nome: 'Tomate', qtd: 15, raio: 46 },
  presunto: { nome: 'Presunto', qtd: 24, raio: 36 },
  frango: { nome: 'Frango', qtd: 56, raio: 22 },
  calabresa: { nome: 'Calabresa', qtd: 26, raio: 44 },
  pepperoni: { nome: 'Pepperoni', qtd: 30, raio: 38 },
  bacon: { nome: 'Bacon', qtd: 30, raio: 34 },
  ovo: { nome: 'Ovo', qtd: 10, raio: 42 },
  champignon: { nome: 'Champignon', qtd: 20, raio: 36 },
  milho: { nome: 'Milho', qtd: 120, raio: 10 },
  cebola: { nome: 'Cebola', qtd: 20, raio: 34 },
  azeitona: { nome: 'Azeitona', qtd: 16, raio: 20 },
  gorgonzola: { nome: 'Gorgonzola', qtd: 44, raio: 13 },
  manjericao: { nome: 'Manjericão', qtd: 14, raio: 34 },
  parmesao: { nome: 'Parmesão', qtd: 220, raio: 4 },
  oregano: { nome: 'Orégano', qtd: 260, raio: 3 },
  banana: { nome: 'Banana', qtd: 22, raio: 30 },
  morango: { nome: 'Morango', qtd: 18, raio: 34 },
  canela: { nome: 'Canela', qtd: 260, raio: 3 },
  granulado: { nome: 'Granulado', qtd: 220, raio: 5 }
}

export const ORDEM_CAMADAS = Object.keys(INGREDIENTES)
