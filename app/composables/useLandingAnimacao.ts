export function useRolarPara() {
  const reduzir = useReducedMotion()

  return (id: string) => {
    const alvo = document.getElementById(id)
    if (!alvo) return
    alvo.scrollIntoView({ behavior: reduzir.value ? 'auto' : 'smooth', block: 'start' })
    if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1')
    alvo.focus({ preventScroll: true })
  }
}

export function useRevelarAoRolar(raiz: Ref<HTMLElement | null>) {
  const reduzir = useReducedMotion()
  let observador: IntersectionObserver | undefined

  onMounted(() => {
    const el = raiz.value
    if (!el || reduzir.value || !('IntersectionObserver' in window)) return

    observador = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue
        entrada.target.classList.add('revelado')
        observador?.unobserve(entrada.target)
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 })

    const alvos = el.querySelectorAll('[data-revela]')
    const altura = window.innerHeight
    alvos.forEach((alvo) => {
      if (alvo.getBoundingClientRect().top < altura * 0.9) alvo.classList.add('revelado')
      else observador?.observe(alvo)
    })
    el.classList.add('anima')
  })

  onBeforeUnmount(() => observador?.disconnect())
}
