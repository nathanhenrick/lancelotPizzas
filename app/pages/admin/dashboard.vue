<template>
  <div>
    <HeaderTemplate>
      Painel de Controle
      <template #descricao>Pedidos e cardápio de {{ cardapio.config.nome }}.</template>
      <template #acoes>
        <span class="text-body-secondary small"><i class="bi bi-calendar3 me-1" aria-hidden="true" />{{ hoje }}</span>
      </template>
    </HeaderTemplate>

    <p v-if="!cardapio.sabores.length" class="alert alert-info mb-4">
      O cardápio ainda está vazio. Comece por <NuxtLink to="/admin/precos">tamanhos e preços</NuxtLink> e cadastre os <NuxtLink to="/admin/sabores">sabores</NuxtLink>.
    </p>

    <div class="row row-gap-3 mb-4">
      <div class="col-6 col-xl-3">
        <AdminStatCard rotulo="Pedidos hoje" :valor="resumo.pedidos_hoje" icone="bi-receipt" :carregando="isLoading" />
      </div>
      <div class="col-6 col-xl-3">
        <AdminStatCard rotulo="Vendas hoje" :valor="formatarPreco(resumo.vendas_hoje)" icone="bi-cash-coin" cor="escura" :carregando="isLoading" />
      </div>
      <div class="col-6 col-xl-3">
        <AdminStatCard rotulo="Aguardando" :valor="resumo.aguardando" icone="bi-hourglass-split" :carregando="isLoading" />
      </div>
      <div class="col-6 col-xl-3">
        <AdminStatCard rotulo="Ticket médio" :valor="formatarPreco(resumo.ticket_medio)" icone="bi-graph-up" cor="escura" :carregando="isLoading" />
      </div>
    </div>

    <div class="row row-gap-3">
      <div class="col-xl-8">
        <section class="card p-3 h-100" aria-labelledby="ultimos-titulo">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 id="ultimos-titulo" class="h5 fw-bold m-0">Últimos pedidos</h2>
            <NuxtLink to="/admin/pedidos" class="small fw-semibold">Ver todos</NuxtLink>
          </div>
          <Loader v-if="isLoading" />
          <p v-else-if="!ultimos.length" class="text-body-secondary text-center py-4 mb-0">
            Nenhum pedido ainda. Os pedidos enviados pelo site aparecem aqui.
          </p>
          <div v-else class="d-none d-md-block table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Cliente</th>
                  <th>Quando</th>
                  <th>Situação</th>
                  <th class="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in ultimos" :key="p.id">
                  <td>{{ p.id }}</td>
                  <td class="fw-semibold">{{ p.cliente || 'Sem nome' }}</td>
                  <td>{{ formatarDataHora(p.criado_em) }}</td>
                  <td><AdminStatusBadge :status="p.status" :modo="p.modo" /></td>
                  <td class="text-end">{{ formatarPreco(p.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ul v-if="ultimos.length && !isLoading" class="d-md-none list-unstyled m-0 d-flex flex-column gap-2">
            <li v-for="p in ultimos" :key="p.id" class="pedido-recente">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <div class="fw-semibold text-break">Nº {{ p.id }} · {{ p.cliente || 'Sem nome' }}</div>
                <AdminStatusBadge :status="p.status" :modo="p.modo" />
              </div>
              <div class="d-flex justify-content-between small text-body-secondary mt-1">
                <span>{{ formatarDataHora(p.criado_em) }}</span>
                <span class="fw-bold text-body">{{ formatarPreco(p.total) }}</span>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <div class="col-xl-4">
        <section class="card p-3 h-100" aria-labelledby="sabores-titulo">
          <h2 id="sabores-titulo" class="h5 fw-bold mb-3">Sabores mais pedidos <span class="fw-normal small text-body-secondary">(30 dias)</span></h2>
          <Loader v-if="isLoading" />
          <p v-else-if="!maisPedidos.length" class="text-body-secondary text-center py-4 mb-0">Sem dados ainda.</p>
          <ol v-else class="list-unstyled d-flex flex-column gap-3 mb-0">
            <li v-for="s in maisPedidos" :key="s.nome">
              <div class="d-flex justify-content-between small mb-1">
                <span class="fw-semibold">{{ s.nome }}</span>
                <span class="text-body-secondary">{{ s.qtd }} {{ s.qtd === 1 ? 'pedido' : 'pedidos' }}</span>
              </div>
              <div class="progress" style="height: 8px" aria-hidden="true">
                <div class="progress-bar bg-primary" :style="{ width: `${s.percentual}%` }" />
              </div>
            </li>
          </ol>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResumoDashboard } from '~/types/pizza'

const { $services } = useNuxtApp()
const cardapio = useCardapioStore()
const alerta = useAlerta()

useHead({ title: 'Dashboard' })
definePageMeta({ layout: 'admin' })

const resumo = ref<ResumoDashboard>({
  pedidos_hoje: 0,
  vendas_hoje: 0,
  aguardando: 0,
  ticket_medio: 0,
  ultimos_pedidos: [],
  sabores_mais_pedidos: []
})
const isLoading = ref(true)

const hoje = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date())

onMounted(async () => {
  try {
    resumo.value = (await $services.dashboard.get()).data
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível carregar o resumo.'))
  } finally {
    isLoading.value = false
  }
})

const ultimos = computed(() => resumo.value.ultimos_pedidos)

const maisPedidos = computed(() => {
  const lista = resumo.value.sabores_mais_pedidos
  const maior = lista[0]?.qtd ?? 1
  return lista.map((s) => ({ ...s, percentual: Math.round((s.qtd / maior) * 100) }))
})
</script>

<style scoped>
.pedido-recente {
  padding: 0.75rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
}
</style>
