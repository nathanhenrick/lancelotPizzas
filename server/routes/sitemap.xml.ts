export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiBaseUrl = config.apiBaseUrlServidor || config.public.apiBaseUrl

  let temEsfirras = true
  try {
    const resposta = await $fetch<{ data: { ativo?: boolean }[] }>(`${apiBaseUrl}/esfirras`, {
      headers: { Accept: 'application/json' },
      timeout: 3000
    })
    temEsfirras = resposta.data.some((e) => e.ativo !== false)
  } catch {
  }

  const caminhos = ['/', ...(temEsfirras ? ['/loja', '/esfirras'] : []), '/pizza', '/sobre', '/privacidade']
  const base = urlDoSite(event)
  const escapar = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const urls = caminhos.map((c) => `  <url><loc>${escapar(base + c)}</loc></url>`).join('\n')

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
})
