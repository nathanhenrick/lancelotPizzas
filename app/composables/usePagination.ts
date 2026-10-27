import type { Ref, WatchSource } from 'vue'

export const usePagination = <T>(itens: Ref<T[]>, tamanhoInicial = 10, reiniciarQuando?: WatchSource) => {
  const page = ref(1)
  const pageSize = ref(tamanhoInicial)

  const total = computed(() => itens.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const paginated = computed(() => itens.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
  const rangeStart = computed(() => (total.value ? (page.value - 1) * pageSize.value + 1 : 0))
  const rangeEnd = computed(() => Math.min(page.value * pageSize.value, total.value))

  watch(totalPages, (ultima) => { if (page.value > ultima) page.value = ultima })

  if (reiniciarQuando) watch(reiniciarQuando, () => { page.value = 1 })

  const setPage = (p: number) => { page.value = Math.min(Math.max(1, p), totalPages.value) }
  const setPageSize = (tamanho: number | string) => {
    pageSize.value = Number(tamanho)
    page.value = 1
  }

  return { paginated, page, pageSize, total, totalPages, rangeStart, rangeEnd, setPage, setPageSize }
}
