export default defineNuxtRouteMiddleware(async (to) => {
  const noPainel = to.path.startsWith('/admin')
  const naEntrada = to.path === '/login'
  if (import.meta.server || (!noPainel && !naEntrada)) return

  const auth = useAuthStore()
  const logado = auth.autenticado || (await auth.restaurar())

  if (!logado) {
    if (naEntrada) return
    return navigateTo({ path: '/login', query: to.path !== '/admin/dashboard' ? { voltar: to.fullPath } : {} })
  }

  const atendente = auth.usuario?.papel === 'atendente'
  if (naEntrada) return navigateTo(atendente ? '/admin/pedidos' : '/admin/dashboard')
  if (atendente && !to.path.startsWith('/admin/pedidos')) return navigateTo('/admin/pedidos')
})
