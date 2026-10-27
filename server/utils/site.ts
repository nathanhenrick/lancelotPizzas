import type { H3Event } from 'h3'

export function urlDoSite(event: H3Event): string {
  const configurada = String(useRuntimeConfig(event).public.siteUrl || '')
  const origem = configurada || getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
  return origem.replace(/\/+$/, '')
}
