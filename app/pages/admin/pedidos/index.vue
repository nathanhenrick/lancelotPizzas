<template>
  <div>
    <HeaderTemplate>Pedidos</HeaderTemplate>

    <section class="card p-3">
      <nav class="d-flex flex-wrap gap-2 justify-content-between mb-3 align-items-center" aria-label="Filtros">
        <div class="d-flex flex-wrap align-items-center gap-2">
          <SearchInput v-model="searchQuery" placeholder="Pesquisar por cliente" @search="setQuery(searchQuery)" />
          <AdminFiltroSelect v-model="filtroStatus" rotulo="Situação" :opcoes="opcoesStatus" todas="Todas" />
          <AdminFiltroSelect v-model="filtroModo" rotulo="Recebimento" :opcoes="OPCOES_MODO" todas="Todos" />
        </div>
      </nav>

      <ModalTemplate :open="Boolean(aberto)" @close="aberto = null">
        <template #header>
          <h2 class="h5 m-0 fw-bold">Pedido nº {{ aberto?.id }}</h2>
        </template>
        <template v-if="aberto" #content>
          <dl class="row mb-3">
            <dt class="col-4">Cliente</dt>
            <dd class="col-8">{{ aberto.cliente || 'Sem nome' }}</dd>
            <dt class="col-4">Quando</dt>
            <dd class="col-8">{{ formatarDataHora(aberto.criado_em) }}</dd>
            <dt class="col-4">Recebimento</dt>
            <dd class="col-8">{{ aberto.modo === 'entrega' ? 'Entrega' : 'Retirada no balcão' }}</dd>
          </dl>
          <ul class="list-group mb-3">
            <li v-for="linha in aberto.linhas" :key="linha.titulo" class="list-group-item d-flex justify-content-between gap-3">
              <div>
                <div class="fw-semibold">{{ linha.titulo }}</div>
                <div v-for="d in linha.detalhes" :key="d" class="small text-body-secondary">{{ d }}</div>
              </div>
              <span class="text-nowrap">{{ formatarPreco(linha.preco) }}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between fw-bold">
              <span>Total</span>
              <span>{{ formatarPreco(aberto.total) }}</span>
            </li>
          </ul>
          <AdminFormField v-slot="campo" rotulo="Situação">
            <select :id="campo.id" class="form-select" :value="aberto.status" @change="escolherStatus(aberto, $event)">
              <option v-for="(_, chave) in STATUS_PEDIDO" :key="chave" :value="chave">{{ rotuloStatus(chave, aberto.modo) }}</option>
            </select>
          </AdminFormField>
        </template>
        <template #buttons>
          <div class="w-100 d-flex justify-content-end">
            <button type="button" class="btn btn-outline-secondary" @click="aberto = null">Fechar</button>
          </div>
        </template>
      </ModalTemplate>

      <Loader v-if="isLoading" />
      <template v-else>
        <div class="d-none d-md-block table-responsive">
          <table class="table table-hover table-striped">
            <thead>
              <tr>
                <th style="width: 70px">Nº</th>
                <th>Quando</th>
                <th>Cliente</th>
                <th>Pizza</th>
                <th>Situação</th>
                <th class="text-end">Total</th>
                <th style="width: 230px" class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!total">
                <td colspan="7" class="text-center text-body-secondary py-3">Nenhum pedido encontrado.</td>
              </tr>
              <tr v-for="p in paginated" :key="p.id">
                <td>{{ p.id }}</td>
                <td>{{ formatarDataHora(p.criado_em) }}</td>
                <td class="fw-semibold">{{ p.cliente || 'Sem nome' }}</td>
                <td>{{ p.sabores.join(' / ') }}</td>
                <td><AdminStatusBadge :status="p.status" :modo="p.modo" /></td>
                <td class="text-end">{{ formatarPreco(p.total) }}</td>
                <td class="text-end">
                  <div class="d-flex justify-content-end align-items-center gap-2">
                    <AdminSituacaoPedido :pedido="p.id" :status="p.status" :modo="p.modo" @mudar="alterarStatus(p, $event)" />
                    <button type="button" class="btn btn-sm btn-outline-secondary" :aria-label="`Ver pedido ${p.id}`" title="Ver pedido" @click="aberto = p">
                      <i class="bi bi-eye" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-md-none">
          <p v-if="!total" class="text-center py-3 text-body-secondary">Nenhum pedido encontrado.</p>
          <div v-for="p in paginated" :key="p.id" class="card mb-2 p-3">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div class="nome-destaque">Nº {{ p.id }} · {{ p.cliente || 'Sem nome' }}</div>
              <AdminStatusBadge :status="p.status" :modo="p.modo" />
            </div>
            <div class="mb-1">{{ p.sabores.join(' / ') }}</div>
            <div class="small text-body-secondary">{{ formatarDataHora(p.criado_em) }}</div>
            <div class="mt-2 d-flex justify-content-between align-items-center border-top pt-2">
              <span class="fw-bold">{{ formatarPreco(p.total) }}</span>
              <div class="d-flex align-items-center gap-2">
                <AdminSituacaoPedido :pedido="p.id" :status="p.status" :modo="p.modo" @mudar="alterarStatus(p, $event)" />
                <button type="button" class="btn btn-sm btn-outline-secondary" :aria-label="`Ver pedido ${p.id}`" @click="aberto = p">
                  <i class="bi bi-eye" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <Pagination
          v-if="total > 0"
          :page="page"
          :total-pages="totalPages"
          :page-size="pageSize"
          :total="total"
          :range-start="rangeStart"
          :range-end="rangeEnd"
          @update:page="setPage"
          @update:page-size="setPageSize"
        />
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Pedido, StatusPedido } from '~/types/pizza'

const { $services } = useNuxtApp()
const alerta = useAlerta()

useHead({ title: 'Pedidos' })
definePageMeta({ layout: 'admin' })

const pedidos = ref<Pedido[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const filtroStatus = ref<StatusPedido | ''>('')
const filtroModo = ref('')
const OPCOES_MODO = [{ valor: 'entrega', rotulo: 'Entrega' }, { valor: 'retirada', rotulo: 'Retirada no balcão' }]
const opcoesStatus = Object.entries(STATUS_PEDIDO).map(([valor, info]) => ({ valor, rotulo: info.rotulo }))
const aberto = ref<Pedido | null>(null)

const ordenados = computed(() =>
  pedidos.value.filter((p) => (!filtroStatus.value || p.status === filtroStatus.value) && (!filtroModo.value || p.modo === filtroModo.value)).sort((a, b) => b.id - a.id)
)
const { filtered, query, setQuery } = useSearch(ordenados, ['cliente'])
const { paginated, page, pageSize, total, totalPages, rangeStart, rangeEnd, setPage, setPageSize } = usePagination(filtered, 10, () => [query.value, filtroStatus.value, filtroModo.value])

async function fetchPedidos() {
  try {
    pedidos.value = (await $services.pedidos.getAll()).data
  } catch (err) {
    console.error(err)
    if (isLoading.value) alerta.erro(mensagemErro(err, 'Não foi possível carregar os pedidos.'))
  } finally {
    isLoading.value = false
  }
}

let atualizacao: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  fetchPedidos()
  atualizacao = setInterval(fetchPedidos, 30_000)
})
onBeforeUnmount(() => clearInterval(atualizacao))

async function mudarStatus(p: Pedido, status: StatusPedido) {
  try {
    await $services.pedidos.atualizarStatus(p.id, status)
    p.status = status
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível atualizar o pedido.'))
  }
}

async function alterarStatus(p: Pedido, novo: StatusPedido) {
  if (novo === 'cancelado' && !(await alerta.confirmar(`O pedido nº ${p.id} será marcado como cancelado.`, 'Sim, cancelar'))) return
  await mudarStatus(p, novo)
}

async function escolherStatus(p: Pedido, evento: Event) {
  const campo = evento.target as HTMLSelectElement
  await alterarStatus(p, campo.value as StatusPedido)
  campo.value = p.status
}
</script>

