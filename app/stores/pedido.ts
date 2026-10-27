import { defineStore } from 'pinia'
import type { AjusteParte, Borda, Etapa, LinhaPedido, ModoEntrega, PizzaVisual, TamanhoId } from '~/types/pizza'
import { FRACOES } from '~/data/cardapio'
import { COR_BEBIDA_PADRAO } from '~/data/bebidas'
import { COR_ESFIRRA_PADRAO } from '~/data/esfirras'

const BORDA_PADRAO: Borda = { id: 0, nome: 'Tradicional', p: 0, m: 0, g: 0, cor: null, ativo: true }

const MAX_PARTES = 4

const MODELOS_SEM_ENTREGA = ['jarra', 'copo']

const estadoInicial = () => ({
  etapa: 'montar' as Etapa,
  produto: null as 'pizza' | 'esfirra' | null,
  tamanho: 'g' as TamanhoId,
  qtdSabores: 2,
  partes: Array<number | null>(MAX_PARTES).fill(null),
  ajustes: Array.from({ length: MAX_PARTES }, ajusteVazio) as AjusteParte[],
  parteAtiva: -1,
  seletorAberto: false,
  parteDestaque: -1,
  borda: null as number | null,
  bebidas: {} as Record<number, number>,
  esfirras: {} as Record<string, number>,
  ajustesEsfirra: {} as Record<string, AjusteParte>,
  esfirraAjustando: null as string | null,
  modo: null as ModoEntrega | null,
  nome: '',
  numero: null as number | null,
  totalConfirmado: null as number | null,
  enviando: false,
  erroEnvio: ''
})

export const usePedidoStore = defineStore('pedido', {
  state: estadoInicial,

  getters: {
    tamanhoAtual: (s) => {
      const { tamanhos } = useCardapioStore()
      return tamanhos.find((t) => t.id === s.tamanho) ?? tamanhos[0]!
    },
    bordaAtual: (s): Borda => {
      const { bordasAtivas } = useCardapioStore()
      return bordasAtivas.find((b) => b.id === s.borda) ?? bordasAtivas[0] ?? BORDA_PADRAO
    },
    fracao: (s) => FRACOES[s.qtdSabores]!,
    saboresDasPartes: (s) => s.partes.slice(0, s.qtdSabores).map(useCardapioStore().saborPorId),

    preenchidas(): number {
      return this.saboresDasPartes.filter(Boolean).length
    },
    completa(): boolean {
      return this.preenchidas === this.qtdSabores
    },
    produtoAtual: (s) => s.produto ?? (useCardapioStore().esfirrasAtivas.length ? null : 'pizza'),
    temPizza(): boolean {
      return this.preenchidas > 0
    },
    esfirrasPedidas: (s) => {
      const { esfirrasAtivas, adicionais } = useCardapioStore()
      return esfirrasPedidas(esfirrasAtivas, s.esfirras, s.ajustesEsfirra, adicionais)
    },
    qtdEsfirras(): number {
      return this.esfirrasPedidas.reduce((t, p) => t + p.quantidade, 0)
    },
    podeAvancar(): boolean {
      return this.temPizza ? this.completa : this.qtdEsfirras > 0
    },

    precoPizza(): number {
      const { faixas, config } = useCardapioStore()
      const precos = this.saboresDasPartes.flatMap((sabor) => (sabor ? [faixas[sabor.faixa][this.tamanho]] : []))
      if (!precos.length) return 0
      if (config.regra_preco === 'media') return Math.round((precos.reduce((t, p) => t + p, 0) / precos.length) * 100) / 100
      return Math.max(...precos)
    },
    precoBorda(): number {
      return this.temPizza ? this.bordaAtual[this.tamanho] : 0
    },
    precoAdicionais(): number {
      const { adicionais } = useCardapioStore()
      return this.saboresDasPartes.reduce((total, sabor, i) =>
        total + (sabor ? this.ajustes[i]!.adicionais.reduce((t, id) => t + (adicionais.find((a) => a.id === id)?.preco ?? 0), 0) : 0), 0)
    },
    precoEsfirras(): number {
      return this.esfirrasPedidas.reduce((t, p) => t + (p.preco + p.extras) * p.quantidade, 0)
    },
    precoBebidas: (s) => useCardapioStore().bebidasAtivas.reduce((t, b) => t + b.preco * (s.bebidas[b.id] ?? 0), 0),
    bebidasSemEntrega: (s): string[] =>
      useCardapioStore().bebidasAtivas.flatMap((b) =>
        (s.bebidas[b.id] ?? 0) > 0 && b.modelo && MODELOS_SEM_ENTREGA.includes(b.modelo) ? [b.nome] : []
      ),
    total(): number {
      return Math.round((this.precoPizza + this.precoBorda + this.precoAdicionais + this.precoBebidas + this.precoEsfirras) * 100) / 100
    },

    mostraEsfirras(): boolean {
      if (this.etapa === 'montar') return this.produtoAtual === 'esfirra'
      return !this.temPizza && this.qtdEsfirras > 0
    },

    visual(): PizzaVisual {
      const { esfirrasAtivas } = useCardapioStore()
      const pedidas = esfirrasAtivas.flatMap((e) => {
        const quantidade = this.esfirrasPedidas.filter((p) => p.esfirra.id === e.id).reduce((t, p) => t + p.quantidade, 0)
        return quantidade > 0 ? [{ id: e.id, cor: e.cor ?? COR_ESFIRRA_PADRAO, quantidade }] : []
      })
      return {
        modo: this.mostraEsfirras ? 'esfirra' : 'pizza',
        esfirras: pedidas.length || !esfirrasAtivas[0] ? pedidas : [{ id: esfirrasAtivas[0].id, cor: esfirrasAtivas[0].cor ?? COR_ESFIRRA_PADRAO, quantidade: 1 }],
        qtd: this.qtdSabores,
        partes: this.saboresDasPartes,
        escala: this.tamanhoAtual.escala,
        corRecheio: this.bordaAtual.cor,
        destaque: this.seletorAberto ? this.parteAtiva : this.parteDestaque,
        bebidas: useCardapioStore().bebidasAtivas.flatMap((b) =>
          (this.bebidas[b.id] ?? 0) > 0 && b.modelo ? [{ id: b.id, modelo: b.modelo, cor: b.cor ?? COR_BEBIDA_PADRAO, nome: b.nome, logo: b.logo, quantidade: this.bebidas[b.id] }] : []
        )
      }
    },

    descricao(): string {
      if (this.mostraEsfirras) return this.qtdEsfirras ? `${this.qtdEsfirras} ${this.qtdEsfirras === 1 ? 'esfirra' : 'esfirras'} na tábua.` : 'Esfirra de exemplo na tábua.'
      const partes = this.saboresDasPartes.map((sabor, i) =>
        this.qtdSabores === 1 ? (sabor?.nome ?? 'sem sabor escolhido') : `parte ${i + 1}: ${sabor?.nome ?? 'vazia'}`
      )
      return `Pizza ${this.tamanhoAtual.nome}, ${this.qtdSabores === 1 ? 'inteira' : `dividida em ${this.qtdSabores} partes`}. ${partes.join(', ')}. Borda ${this.bordaAtual.nome.toLowerCase()}.`
    },

    linhas(): LinhaPedido[] {
      const prefixo = this.qtdSabores > 1 ? `${this.fracao} ` : ''
      const { adicionais } = useCardapioStore()
      const linhas: LinhaPedido[] = this.temPizza
        ? [{
            titulo: `Pizza ${this.tamanhoAtual.nome}`,
            detalhes: this.saboresDasPartes.map((s, i) => {
              const notas = notasDoAjuste(this.ajustes[i], adicionais)
              return prefixo + (s?.nome ?? '') + (notas.length ? ` (${notas.join('; ')})` : '')
            }),
            preco: this.precoPizza
          }]
        : []
      if (this.precoAdicionais > 0) {
        linhas.push({
          titulo: 'Adicionais',
          detalhes: this.saboresDasPartes.flatMap((s, i) => (s ? this.ajustes[i]!.adicionais.flatMap((id) => adicionais.find((a) => a.id === id)?.nome ?? []) : [])),
          preco: this.precoAdicionais
        })
      }
      if (this.temPizza && (this.bordaAtual.cor !== null || this.precoBorda > 0)) linhas.push({ titulo: 'Borda', detalhes: [this.bordaAtual.nome], preco: this.precoBorda })
      for (const b of useCardapioStore().bebidasAtivas) {
        const qtd = this.bebidas[b.id] ?? 0
        if (qtd) linhas.push({ titulo: `${qtd}× ${b.nome}`, detalhes: [], preco: qtd * b.preco })
      }
      for (const p of this.esfirrasPedidas) {
        linhas.push({ titulo: `${p.quantidade}× ${nomeComTamanho(p)}`, detalhes: p.notas.length ? [p.notas.join('; ')] : [], preco: p.quantidade * (p.preco + p.extras) })
      }
      return linhas
    },

    mensagem(): string {
      const prefixo = this.qtdSabores > 1 ? `${this.fracao} ` : ''
      const txt = [`*Novo pedido · ${useCardapioStore().config.nome?.trim() || 'Pizzaria'}*`, '']
      if (this.temPizza) {
        txt.push(
          `1× Pizza ${this.tamanhoAtual.nome} (${this.tamanhoAtual.info})`,
          `   _Borda: ${this.bordaAtual.nome}_`,
          ...this.saboresDasPartes.map((s, i) => {
            const notas = notasDoAjuste(this.ajustes[i], useCardapioStore().adicionais)
            return `   ${prefixo}${s?.nome ?? ''}${notas.length ? ` _(${notas.join('; ')})_` : ''}`
          })
        )
      }
      for (const b of useCardapioStore().bebidasAtivas) {
        const qtd = this.bebidas[b.id] ?? 0
        if (qtd) txt.push(`${qtd}× ${b.nome}`)
      }
      for (const p of this.esfirrasPedidas) {
        txt.push(`${p.quantidade}× ${nomeComTamanho(p)}${p.notas.length ? ` _(${p.notas.join('; ')})_` : ''}`)
      }
      txt.push(
        '',
        this.modo === 'retirada' ? '*Retirada no balcão*' : '*Entrega*',
        `Nome: ${this.nome.trim() || '(não informado)'}`,
        '',
        `Total: ${formatarPreco(this.totalConfirmado ?? this.total)}`
      )
      return txt.join('\n')
    }
  },

  actions: {
    definirTamanho(id: TamanhoId) {
      this.tamanho = id
      this.qtdSabores = Math.min(this.qtdSabores, this.tamanhoAtual.max_sabores)
    },
    definirQtdSabores(n: number) {
      if (n < 1 || n > this.tamanhoAtual.max_sabores) return
      this.qtdSabores = n
      this.fecharSeletor()
    },
    abrirSeletor(parte: number) {
      if (this.etapa !== 'montar' || parte < 0 || parte >= this.qtdSabores) return
      this.parteAtiva = parte
      this.seletorAberto = true
    },
    fecharSeletor() {
      this.seletorAberto = false
      this.parteAtiva = -1
    },
    escolherSabor(id: number, ajuste: AjusteParte = ajusteVazio()) {
      if (this.parteAtiva < 0) return
      this.partes[this.parteAtiva] = id
      this.ajustes[this.parteAtiva] = ajuste
    },
    limparSabores() {
      this.partes = Array<number | null>(MAX_PARTES).fill(null)
      this.ajustes = Array.from({ length: MAX_PARTES }, ajusteVazio)
      this.fecharSeletor()
    },
    definirBebida(id: number, qtd: number) {
      this.bebidas[id] = Math.max(0, Math.min(20, qtd))
    },
    abrirAjusteEsfirra(chave: string) {
      this.esfirraAjustando = chave
    },
    fecharAjusteEsfirra() {
      this.esfirraAjustando = null
    },
    confirmarAjusteEsfirra(chave: string, ajuste: AjusteParte) {
      this.ajustesEsfirra[chave] = ajuste
      this.esfirraAjustando = null
    },
    definirEsfirra(chave: string, qtd: number) {
      this.esfirras[chave] = Math.max(0, Math.min(50, qtd))
    },
    irPara(etapa: Etapa) {
      this.fecharSeletor()
      this.parteDestaque = -1
      this.erroEnvio = ''
      this.etapa = etapa
    },
    async enviar() {
      if (this.enviando) return
      const { $services } = useNuxtApp()
      const cardapio = useCardapioStore()
      this.enviando = true
      this.erroEnvio = ''
      try {
        const { data } = await $services.pedidos.registrar({
          cliente: this.nome.trim(),
          modo: this.modo ?? 'retirada',
          ...(this.temPizza ? { tamanho: this.tamanho } : {}),
          sabores: this.saboresDasPartes.flatMap((s) => (s ? [s.id] : [])),
          ajustes: this.saboresDasPartes.flatMap((s, i) => (s ? [this.ajustes[i]!] : [])),
          borda: this.temPizza ? this.bordaAtual.id || null : null,
          bebidas: cardapio.bebidasAtivas.flatMap((b) => {
            const quantidade = this.bebidas[b.id] ?? 0
            return quantidade ? [{ id: b.id, quantidade }] : []
          }),
          esfirras: this.esfirrasPedidas.map((p) => ({
            id: p.esfirra.id,
            tamanho: p.tamanho,
            quantidade: p.quantidade,
            ...(temAjuste(p.ajuste) ? { ajuste: p.ajuste } : {})
          }))
        })
        this.numero = data.id
        this.totalConfirmado = data.total
        if (data.total !== this.total) await cardapio.carregar()
        this.irPara('enviado')
      } catch (err) {
        this.erroEnvio = mensagemErro(err, 'Não foi possível enviar o pedido. Confira a sua conexão e tente de novo.')
      } finally {
        this.enviando = false
      }
    },
    reiniciar() {
      const { nome, modo } = this
      this.$patch((s) => Object.assign(s, { ...estadoInicial(), nome, modo }))
    }
  }
})
