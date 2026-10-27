export const useReducedMotion = () => {
  const reduzir = ref(false)

  onMounted(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduzir.value = mq.matches
    const aoMudar = (e: MediaQueryListEvent) => { reduzir.value = e.matches }
    mq.addEventListener('change', aoMudar)
    onBeforeUnmount(() => mq.removeEventListener('change', aoMudar))
  })

  return reduzir
}
