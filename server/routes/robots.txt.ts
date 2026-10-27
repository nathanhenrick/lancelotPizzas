export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return ['User-agent: *', 'Disallow: /admin', '', `Sitemap: ${urlDoSite(event)}/sitemap.xml`, ''].join('\n')
})
