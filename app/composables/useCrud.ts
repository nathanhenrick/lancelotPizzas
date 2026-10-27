import type { Ref } from 'vue'

interface ServicoLista<T> {
  getAll: () => Promise<{ data: T[] }>
}

interface OpcoesCrud<T> {
  filtro?: (item: T) => boolean
  reiniciarQuando?: () => unknown
}

export const useCrud = <T extends object>(servico: ServicoLista<T>, camposBusca: (keyof T)[], opcoes: OpcoesCrud<T> = {}) => {
  const itens = ref([]) as Ref<T[]>
  const isLoading = ref(true)
  const searchQuery = ref('')

  const { filtro, reiniciarQuando } = opcoes
  const visiveis = computed(() => (filtro ? itens.value.filter(filtro) : itens.value))

  const { filtered, query, setQuery } = useSearch(visiveis, camposBusca)
  const paginacao = usePagination(filtered, 10, () => [query.value, reiniciarQuando?.()])

  async function fetchData() {
    isLoading.value = true
    try {
      itens.value = (await servico.getAll()).data
    } catch (err) {
      console.error(err)
      useAlerta().erro(mensagemErro(err, 'Não foi possível carregar a lista.'))
    } finally {
      isLoading.value = false
    }
  }

  onMounted(fetchData)

  return { itens, filtered, isLoading, searchQuery, setQuery, fetchData, ...paginacao }
}
