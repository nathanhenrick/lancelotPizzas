const LAYOUTS_COM_BOOTSTRAP = ['landing', 'admin', 'auth']

const usaBootstrap = (layout: unknown) => typeof layout === 'string' && LAYOUTS_COM_BOOTSTRAP.includes(layout)

export default defineNuxtPlugin(() => {
  useRouter().beforeEach((to, from) => {
    if (!from.matched.length || !usaBootstrap(from.meta.layout) || usaBootstrap(to.meta.layout)) return
    window.location.assign(to.fullPath)
    return false
  })
})
