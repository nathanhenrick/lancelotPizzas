import type { ComputedRef } from 'vue'
import type { PizzaVisual } from '~/types/pizza'

export const useVisualSuave = (visual: ComputedRef<PizzaVisual>, ms = 120) => {
  const suave = shallowRef(visual.value)
  let timer: ReturnType<typeof setTimeout> | undefined
  watch(visual, (novo) => {
    clearTimeout(timer)
    timer = setTimeout(() => { suave.value = novo }, ms)
  })
  onBeforeUnmount(() => clearTimeout(timer))
  return suave
}
