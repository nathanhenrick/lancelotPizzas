import { isAxiosError } from 'axios'

export function errosPorCampo(erro: unknown): Record<string, string> {
  if (!isAxiosError(erro) || erro.response?.status !== 422) return {}
  const erros = erro.response.data?.errors
  if (!erros || typeof erros !== 'object') return {}

  return Object.fromEntries(
    Object.entries(erros as Record<string, string[]>)
      .filter(([, mensagens]) => Array.isArray(mensagens) && mensagens[0])
      .map(([campo, mensagens]) => [campo, mensagens[0] as string])
  )
}

export function mensagemErro(erro: unknown, padrao: string): string {
  if (!isAxiosError(erro) || !erro.response) return padrao
  const { status, data } = erro.response
  if (status === 429) return 'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.'
  if (status === 422 && data?.errors && typeof data.errors === 'object') {
    const primeira = Object.values(data.errors as Record<string, string[]>)[0]?.[0]
    if (primeira) return primeira
  }
  if (status >= 400 && status < 500 && typeof data?.message === 'string' && data.message) return data.message
  return padrao
}
