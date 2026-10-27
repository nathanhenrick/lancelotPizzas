import type { Adicional, AjusteParte, Esfirra } from '~/types/pizza'

export const chaveEsfirra = (id: number, tamanho: string) => `${id}|${tamanho}`

export const tamanhosDaEsfirra = (e: Esfirra) =>
  e.tamanhos?.length ? e.tamanhos : [{ nome: 'Unidade', preco: e.preco }]

export interface EsfirraPedida {
  esfirra: Esfirra
  tamanho: string
  rotuloTamanho: string
  preco: number
  quantidade: number
  ajuste?: AjusteParte
  extras: number
  notas: string[]
}

export function esfirrasPedidas(
  lista: Esfirra[],
  quantidades: Record<string, number>,
  ajustes: Record<string, AjusteParte>,
  adicionais: Adicional[]
): EsfirraPedida[] {
  return lista.flatMap((esfirra) => {
    const tamanhos = tamanhosDaEsfirra(esfirra)
    return tamanhos.flatMap((t) => {
      const chave = chaveEsfirra(esfirra.id, t.nome)
      const quantidade = quantidades[chave] ?? 0
      if (quantidade <= 0) return []
      const ajuste = esfirra.tipo === 'doce' ? undefined : ajustes[chave]
      return [{
        esfirra,
        tamanho: t.nome,
        rotuloTamanho: tamanhos.length > 1 ? t.nome : '',
        preco: t.preco,
        quantidade,
        ajuste,
        extras: (ajuste?.adicionais ?? []).reduce((soma, id) => soma + (adicionais.find((a) => a.id === id)?.preco ?? 0), 0),
        notas: notasDoAjuste(ajuste, adicionais)
      }]
    })
  })
}

export const nomeComTamanho = (p: Pick<EsfirraPedida, 'esfirra' | 'rotuloTamanho'>) =>
  p.rotuloTamanho ? `${p.esfirra.nome} (${p.rotuloTamanho})` : p.esfirra.nome
