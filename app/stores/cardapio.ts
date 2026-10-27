import { defineStore } from 'pinia'
import type { Adicional, Bebida, Borda, Esfirra, Sabor } from '~/types/pizza'
import { CONFIG, FAIXAS, TAMANHOS } from '~/data/cardapio'

export const useCardapioStore = defineStore('cardapio', {
  state: () => ({
    config: { ...CONFIG },
    tamanhos: TAMANHOS.map((t) => ({ ...t })),
    faixas: JSON.parse(JSON.stringify(FAIXAS)) as typeof FAIXAS,
    sabores: [] as Sabor[],
    bordas: [] as Borda[],
    bebidas: [] as Bebida[],
    esfirras: [] as Esfirra[],
    adicionais: [] as Adicional[],
    erro: false,
    carregado: false
  }),

  getters: {
    saboresAtivos: (s) => s.sabores.filter((x) => x.ativo),
    bordasAtivas: (s) => s.bordas.filter((x) => x.ativo),
    bebidasAtivas: (s) => s.bebidas.filter((x) => x.ativo),
    esfirrasAtivas: (s) => s.esfirras.filter((x) => x.ativo),
    adicionaisAtivos: (s) => s.adicionais.filter((x) => x.ativo),
    saborPorId(): (id: number | null) => Sabor | null {
      return (id) => this.saboresAtivos.find((s) => s.id === id) ?? null
    }
  },

  actions: {
    async carregar() {
      const { $services } = useNuxtApp()
      try {
        const vazio = () => ({ data: [] })
        const [config, precos, sabores, bordas, bebidas, esfirras, adicionais] = await Promise.all([
          $services.config.get(),
          $services.precos.get(),
          $services.sabores.getAll(),
          $services.bordas.getAll(),
          $services.bebidas.getAll(),
          $services.esfirras.getAll().catch(vazio),
          $services.adicionais.getAll().catch(vazio)
        ])
        this.config = config.data
        this.tamanhos = precos.data.tamanhos
        this.faixas = precos.data.faixas
        this.sabores = sabores.data
        this.bordas = bordas.data
        this.bebidas = bebidas.data
        this.esfirras = esfirras.data
        this.adicionais = adicionais.data
        this.carregado = true
        this.erro = false
      } catch (err) {
        console.error('Não foi possível carregar o cardápio.', err)
        this.erro = true
      }
    }
  }
})
