import type { ConfigPizzaria, HorarioDia } from '~/types/pizza'

export const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export const horariosPadrao = (): HorarioDia[] =>
  DIAS_SEMANA.map((dia) => ({ dia, fechado: true, abre: null, fecha: null }))

export const horariosCompletos = (horarios: HorarioDia[]): HorarioDia[] =>
  DIAS_SEMANA.map((dia, i) => horarios[i] ?? { dia, fechado: true, abre: null, fecha: null })

export const apenasDigitos = (valor: string): string => valor.replace(/\D/g, '')

export const formatarCnpj = (valor: string): string =>
  apenasDigitos(valor).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')

export const formatarCep = (valor: string): string =>
  apenasDigitos(valor).replace(/^(\d{5})(\d{3})$/, '$1-$2')

export const formatarTelefone = (valor: string): string => {
  const d = apenasDigitos(valor)
  if (d.length === 11) return d.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  return valor
}

export function enderecoCompleto(c: ConfigPizzaria): string {
  const rua = [c.logradouro, c.numero].filter(Boolean).join(', ')
  const lugar = [c.complemento, c.bairro].filter(Boolean).join(' - ')
  const cidade = [c.cidade, c.uf].filter(Boolean).join('/')
  const principal = [rua, lugar, cidade].filter(Boolean).join(' - ')
  return [principal, c.cep ? `CEP ${formatarCep(c.cep)}` : ''].filter(Boolean).join(' · ')
}

export const linkMapa = (c: ConfigPizzaria): string =>
  enderecoCompleto(c) ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto(c))}` : ''

export const linkInstagram = (usuario: string): string => (usuario ? `https://instagram.com/${usuario.replace(/^@/, '')}` : '')

export const linkFacebook = (valor: string): string =>
  !valor ? '' : /^https?:\/\//.test(valor) ? valor : `https://facebook.com/${valor.replace(/^\//, '')}`

export const resumoHorario = (h: HorarioDia): string =>
  h.fechado || !h.abre || !h.fecha ? 'Fechado' : `${h.abre} às ${h.fecha}`

const DIA_SCHEMA = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function dadosEstruturadosNegocio(c: ConfigPizzaria, url: string): Record<string, unknown> {
  const rua = [c.logradouro, c.numero].filter(Boolean).join(', ')
  const endereco = {
    '@type': 'PostalAddress',
    streetAddress: rua || undefined,
    addressLocality: c.cidade || undefined,
    addressRegion: c.uf || undefined,
    postalCode: c.cep ? formatarCep(c.cep) : undefined,
    addressCountry: 'BR'
  }
  const temEndereco = Boolean(rua || c.cidade || c.uf || c.cep)
  const horarios = horariosCompletos(c.horarios)
    .map((h, i) => (!h.fechado && h.abre && h.fecha
      ? { '@type': 'OpeningHoursSpecification', dayOfWeek: DIA_SCHEMA[i], opens: h.abre, closes: h.fecha }
      : null))
    .filter(Boolean)
  const redes = [linkInstagram(c.instagram), linkFacebook(c.facebook)].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: c.nome,
    url,
    description: c.descricao || undefined,
    telephone: c.telefone ? `+55${apenasDigitos(c.telefone)}` : undefined,
    email: c.email || undefined,
    address: temEndereco ? endereco : undefined,
    openingHoursSpecification: horarios.length ? horarios : undefined,
    sameAs: redes.length ? redes : undefined
  }
}

export const jsonParaScript = (dados: unknown): string => JSON.stringify(dados).replace(/</g, '\\u003c')

export interface SecaoTexto {
  titulo: string
  paragrafos: string[]
}

export function politicaPadrao(c: ConfigPizzaria, global?: { responsavel?: string, email?: string }): SecaoTexto[] {
  const controlador = c.razao_social || c.nome
  const cnpj = c.cnpj ? `, CNPJ ${formatarCnpj(c.cnpj)}` : ''
  const contato = global?.email || c.email
  const quem = global?.responsavel ? `${global.responsavel}, ` : ''
  return [
    {
      titulo: 'Quem cuida dos seus dados',
      paragrafos: [`${controlador}${cnpj}, é a controladora dos dados pessoais tratados neste site, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, a LGPD).`]
    },
    {
      titulo: 'Quais dados coletamos',
      paragrafos: [
        'Apenas o necessário para o seu pedido: o seu nome, a forma de recebimento (entrega ou retirada) e o que você pediu.',
        'O seu telefone não é digitado aqui: ele chega até nós pelo WhatsApp quando você envia a mensagem do pedido.'
      ]
    },
    {
      titulo: 'Para que usamos',
      paragrafos: ['Para preparar, entregar e confirmar o seu pedido, e para falar com você sobre ele. Não usamos os seus dados para propaganda nem os vendemos.']
    },
    {
      titulo: 'Base legal',
      paragrafos: ['O tratamento acontece para a execução do contrato que você pede ao fazer o pedido (LGPD, art. 7º, V) e para cumprir obrigações legais, como as fiscais (art. 7º, II).']
    },
    {
      titulo: 'Com quem compartilhamos',
      paragrafos: ['Com o WhatsApp (Meta), que transmite a sua mensagem, e com os serviços de hospedagem que mantêm este site no ar. Também podemos informar dados a autoridades quando a lei exigir.']
    },
    {
      titulo: 'Por quanto tempo guardamos',
      paragrafos: ['O pedido fica registrado pelo tempo necessário para o atendimento, para o controle da pizzaria e para cumprir prazos legais. Depois, os dados são apagados ou anonimizados.']
    },
    {
      titulo: 'Cookies e armazenamento no navegador',
      paragrafos: ['Guardamos no seu navegador apenas a sua escolha de tema (claro ou escuro). Não usamos cookies de publicidade ou de rastreamento.']
    },
    {
      titulo: 'Seus direitos',
      paragrafos: [
        'Você pode pedir a confirmação de que tratamos os seus dados, o acesso, a correção, a anonimização ou eliminação, a portabilidade, informações sobre compartilhamento e a revogação de consentimento, quando for o caso (LGPD, art. 18).',
        contato
          ? `Para exercer qualquer um deles, fale com ${quem}pelo e-mail ${contato}.`
          : 'Para exercer qualquer um deles, fale conosco pelo WhatsApp ou pelo balcão.'
      ]
    }
  ]
}
