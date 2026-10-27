import type { Adicional, AjusteParte, Esfirra, Sabor } from '~/types/pizza'
import { INGREDIENTES } from '~/data/ingredientes'

export const ajusteVazio = (): AjusteParte => ({ removidos: [], adicionais: [], observacao: '' })

export const ingredientesDoSabor = (sabor: Sabor): string[] =>
  sabor.ingredientes.map((id) => INGREDIENTES[id]?.nome ?? id.charAt(0).toUpperCase() + id.slice(1))

export const ingredientesDaEsfirra = (esfirra: Esfirra): string[] =>
  (esfirra.ingredientes ?? []).map((id) => INGREDIENTES[id]?.nome ?? id.charAt(0).toUpperCase() + id.slice(1))

export const temAjuste = (a: AjusteParte | undefined) =>
  Boolean(a && (a.removidos.length || a.adicionais.length || a.observacao.trim()))

export function notasDoAjuste(a: AjusteParte | undefined, adicionais: Adicional[]): string[] {
  if (!a) return []
  const notas = a.removidos.map((nome) => `sem ${nome.toLowerCase()}`)
  for (const id of a.adicionais) {
    const extra = adicionais.find((x) => x.id === id)
    if (extra) notas.push(`+ ${extra.nome}`)
  }
  if (a.observacao.trim()) notas.push(`obs: ${a.observacao.trim()}`)
  return notas
}
