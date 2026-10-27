import { brotliCompressSync, gzipSync, constants } from 'node:zlib'

const MINIMO_BYTES = 1024

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event, resposta) => {
    const corpo = resposta.body
    if (typeof corpo !== 'string' || corpo.length < MINIMO_BYTES) return

    const tipo = String(event.node.res.getHeader('content-type') ?? '')
    if (!tipo.includes('text/html') || event.node.res.getHeader('content-encoding')) return

    const aceita = String(event.node.req.headers['accept-encoding'] ?? '')
    let comprimido: Buffer
    let codificacao: string
    if (/\bbr\b/.test(aceita)) {
      comprimido = brotliCompressSync(corpo, { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } })
      codificacao = 'br'
    } else if (/\bgzip\b/.test(aceita)) {
      comprimido = gzipSync(corpo, { level: 6 })
      codificacao = 'gzip'
    } else {
      return
    }

    event.node.res.setHeader('content-encoding', codificacao)
    event.node.res.setHeader('vary', 'Accept-Encoding')
    event.node.res.removeHeader('content-length')
    resposta.body = comprimido
  })
})
