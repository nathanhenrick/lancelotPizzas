import type { Ref } from 'vue'

export const useSearch = <T extends object>(itens: Ref<T[]>, campos: (keyof T)[]) => {
  const query = ref('')

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return itens.value
    return itens.value.filter((item) => campos.some((campo) => String(item[campo] ?? '').toLowerCase().includes(q)))
  })

  const setQuery = (nova: string) => { query.value = nova }

  return { filtered, query, setQuery }
}
