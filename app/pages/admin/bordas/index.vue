<template>
  <div>
    <HeaderTemplate>Bordas</HeaderTemplate>

    <section class="card p-3">
      <nav class="d-flex flex-wrap gap-2 justify-content-between mb-3 align-items-center" aria-label="Ações">
        <div class="d-flex flex-wrap align-items-center gap-2">
          <SearchInput v-model="searchQuery" @search="setQuery(searchQuery)" />
          <AdminFiltroSelect v-model="filtroSituacao" rotulo="Situação" :opcoes="OPCOES_SITUACAO" todas="Todas" />
          <AdminFiltroSelect v-model="filtroRecheio" rotulo="Recheio" :opcoes="OPCOES_RECHEIO" todas="Todas" />
        </div>
        <PrimaryButton @click="state.show = true">
          <i class="bi bi-plus" aria-hidden="true" />
          Adicionar borda
        </PrimaryButton>
      </nav>

      <ModalTemplate :open="state.show" largo @close="closeModal">
        <template #header>
          <h2 class="h5 m-0 fw-bold">{{ state.isEdit ? 'Editar Borda' : 'Adicionar Borda' }}</h2>
        </template>

        <template #content>
          <div class="row row-gap-3">
          <div class="col-md-7 d-flex flex-column gap-3">
            <AdminFormField v-slot="campo" rotulo="Nome" :erro="errors.nome" obrigatorio>
              <input :id="campo.id" v-model="state.nome" type="text" class="form-control" placeholder="Ex.: Recheada com catupiry" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
            </AdminFormField>

            <fieldset>
              <legend class="fw-semibold fs-6 mb-1">Acréscimo por tamanho</legend>
              <div class="row row-gap-2">
                <div v-for="t in cardapio.tamanhos" :key="t.id" class="col-sm-4">
                  <label :for="`borda-${t.id}`" class="small mb-1">{{ t.nome }}</label>
                  <AdminPriceInput :id="`borda-${t.id}`" v-model="state.precos[t.id]" />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend class="fw-semibold fs-6 mb-1">Estilo na pizza</legend>
              <div class="form-check">
                <input id="estilo-tradicional" v-model="state.temRecheio" type="radio" class="form-check-input" name="estilo-borda" :value="false">
                <label for="estilo-tradicional" class="form-check-label">
                  Tradicional
                  <span class="d-block small text-body-secondary">Borda de massa, sem recheio aparente.</span>
                </label>
              </div>
              <div class="form-check">
                <input id="estilo-recheada" v-model="state.temRecheio" type="radio" class="form-check-input" name="estilo-borda" :value="true">
                <label for="estilo-recheada" class="form-check-label">
                  Recheada
                  <span class="d-block small text-body-secondary">Borda mais alta, com um anel de recheio derretendo para dentro.</span>
                </label>
              </div>
            </fieldset>

            <fieldset v-if="state.temRecheio">
              <legend class="fw-semibold fs-6 mb-1">Cor do recheio</legend>
              <div class="d-flex flex-wrap align-items-center gap-2">
                <button
                  v-for="r in RECHEIOS"
                  :key="r.cor"
                  type="button"
                  class="cor-pronta"
                  :class="{ 'cor-pronta--ativa': state.cor === r.cor }"
                  :aria-pressed="state.cor === r.cor"
                  :title="r.nome"
                  @click="state.cor = r.cor"
                >
                  <span class="amostra" :style="{ background: r.cor }" aria-hidden="true" />
                  {{ r.nome }}
                </button>
                <label for="borda-cor" class="d-inline-flex align-items-center gap-2 small mb-0">
                  Outra:
                  <input id="borda-cor" v-model="state.cor" type="color" class="form-control form-control-color">
                </label>
              </div>
            </fieldset>

            <div class="form-check">
              <input id="borda-ativa" v-model="state.ativo" type="checkbox" class="form-check-input">
              <label for="borda-ativa" class="form-check-label fw-semibold">Borda ativa no cardápio</label>
            </div>
          </div>

          <div class="col-md-5">
            <p class="fw-semibold mb-1">Como fica na pizza</p>
            <AdminBordaPreview :cor="corPrevia" :nome="state.nome" />
          </div>
          </div>
        </template>

        <template #buttons>
          <div class="w-100 d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-outline-secondary" @click="closeModal">Cancelar</button>
            <PrimaryButton :carregando="state.isLoading" @click="apply">{{ state.isEdit ? 'Salvar' : 'Adicionar' }}</PrimaryButton>
          </div>
        </template>
      </ModalTemplate>

      <Loader v-if="isLoading" />
      <template v-else>
        <div class="d-none d-md-block table-responsive">
          <table class="table table-hover table-striped">
            <thead>
              <tr>
                <th>Nome</th>
                <th v-for="t in cardapio.tamanhos" :key="t.id">{{ t.nome }}</th>
                <th>Estilo</th>
                <th>Status</th>
                <th style="width: 120px" class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!total">
                <td :colspan="cardapio.tamanhos.length + 4" class="text-center text-body-secondary py-3">Nenhuma borda encontrada.</td>
              </tr>
              <tr v-for="borda in paginated" :key="borda.id">
                <td class="fw-semibold text-primary">{{ borda.nome }}</td>
                <td v-for="t in cardapio.tamanhos" :key="t.id">{{ precoOuIncluida(borda[t.id]) }}</td>
                <td>
                  <span v-if="borda.cor !== null" class="amostra" :style="{ background: paraHex(borda.cor) }" aria-hidden="true" />
                  {{ borda.cor !== null ? 'Recheada' : 'Tradicional' }}
                </td>
                <td><AdminActiveBadge :ativo="borda.ativo" /></td>
                <td class="text-end">
                  <AdminRowActions :nome="borda.nome" @editar="editBorda(borda)" @excluir="deleteBorda(borda)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-md-none">
          <p v-if="!total" class="text-center py-3 text-body-secondary">Nenhuma borda encontrada.</p>
          <div v-for="borda in paginated" :key="borda.id" class="card mb-2 p-3">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div class="nome-destaque">{{ borda.nome }}</div>
              <AdminActiveBadge :ativo="borda.ativo" />
            </div>
            <div class="mb-1">
              <span class="fw-semibold">Estilo: </span>
              <span v-if="borda.cor !== null" class="amostra" :style="{ background: paraHex(borda.cor) }" aria-hidden="true" />
              {{ borda.cor !== null ? 'Recheada' : 'Tradicional' }}
            </div>
            <div v-for="t in cardapio.tamanhos" :key="t.id" class="mb-1">
              <span class="fw-semibold">{{ t.nome }}: </span>{{ precoOuIncluida(borda[t.id]) }}
            </div>
            <div class="mt-2 d-flex justify-content-end border-top pt-2">
              <AdminRowActions :nome="borda.nome" @editar="editBorda(borda)" @excluir="deleteBorda(borda)" />
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
import type { Borda } from '~/types/pizza'

const { $services } = useNuxtApp()
const cardapio = useCardapioStore()
const alerta = useAlerta()

useHead({ title: 'Bordas' })
definePageMeta({ layout: 'admin' })

const COR_PADRAO = '#fff3d2'

const RECHEIOS = [
  { nome: 'Catupiry', cor: '#fff3d2' },
  { nome: 'Cheddar', cor: '#f2a02a' },
  { nome: 'Cream cheese', cor: '#fbf7ee' },
  { nome: 'Chocolate', cor: '#5a3522' },
  { nome: 'Goiabada', cor: '#b3282d' }
]

const state = reactive({
  show: false,
  isEdit: false,
  idEdit: 0,
  isLoading: false,
  nome: '',
  precos: { p: 0, m: 0, g: 0 },
  temRecheio: false,
  cor: COR_PADRAO,
  ativo: true
})
const errors = reactive<Record<string, string>>({})

const OPCOES_SITUACAO = [{ valor: 'ativo', rotulo: 'Ativos' }, { valor: 'inativo', rotulo: 'Inativos' }]
const passaSituacao = (ativo: boolean, filtro: string) => !filtro || (filtro === 'ativo') === ativo
const OPCOES_RECHEIO = [{ valor: 'com', rotulo: 'Recheada' }, { valor: 'sem', rotulo: 'Sem recheio' }]
const filtroSituacao = ref('')
const filtroRecheio = ref('')

const {
  paginated, isLoading, searchQuery, setQuery, fetchData: fetchBordas,
  page, pageSize, total, totalPages, rangeStart, rangeEnd, setPage, setPageSize
} = useCrud($services.bordas, ['nome'], {
  filtro: (b) => passaSituacao(b.ativo, filtroSituacao.value) && (!filtroRecheio.value || (filtroRecheio.value === 'com') === (b.cor !== null)),
  reiniciarQuando: () => [filtroSituacao.value, filtroRecheio.value]
})

const corPrevia = computed(() => (state.temRecheio ? Number.parseInt(state.cor.slice(1), 16) : null))

const paraHex = (cor: number) => `#${cor.toString(16).padStart(6, '0')}`
const precoOuIncluida = (preco: number) => (preco ? `+ ${formatarPreco(preco)}` : 'Incluída')

watch(() => state.nome, () => { delete errors.nome })

function validate() {
  Object.keys(errors).forEach((chave) => delete errors[chave])
  if (!state.nome.trim()) errors.nome = 'O nome é obrigatório.'
  return alerta.validar(errors)
}

function closeModal() {
  state.show = false
  Object.assign(state, { isEdit: false, idEdit: 0, nome: '', precos: { p: 0, m: 0, g: 0 }, temRecheio: false, cor: COR_PADRAO, ativo: true })
  Object.keys(errors).forEach((chave) => delete errors[chave])
}

async function apply() {
  if (!validate()) return
  const payload = {
    nome: state.nome.trim(),
    ...state.precos,
    cor: state.temRecheio ? Number.parseInt(state.cor.slice(1), 16) : null,
    ativo: state.ativo
  }

  try {
    state.isLoading = true
    if (state.isEdit) {
      await $services.bordas.update({ id: state.idEdit, ...payload })
      alerta.sucesso('Borda atualizada.')
    } else {
      await $services.bordas.save(payload)
      alerta.sucesso('Borda adicionada.')
    }
    await Promise.all([fetchBordas(), cardapio.carregar()])
    closeModal()
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível salvar a borda.'))
  } finally {
    state.isLoading = false
  }
}

function editBorda(borda: Borda) {
  Object.assign(state, {
    isEdit: true,
    idEdit: borda.id,
    nome: borda.nome,
    precos: { p: borda.p, m: borda.m, g: borda.g },
    temRecheio: borda.cor !== null,
    cor: borda.cor !== null ? paraHex(borda.cor) : COR_PADRAO,
    ativo: borda.ativo,
    show: true
  })
}

async function deleteBorda(borda: Borda) {
  if (!(await alerta.confirmar(`A borda "${borda.nome}" sai do cardápio. Esta ação não pode ser desfeita.`))) return
  try {
    await $services.bordas.delete(borda.id)
    await Promise.all([fetchBordas(), cardapio.carregar()])
    alerta.sucesso('Borda excluída.')
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível excluir a borda.'))
  }
}
</script>

<style scoped>
.amostra {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-right: 0.375rem;
  border-radius: 50%;
  border: 1px solid var(--bs-border-color);
  vertical-align: -2px;
}

.cor-pronta {
  display: inline-flex;
  align-items: center;
  min-height: 2.25rem;
  padding: 0 0.625rem;
  border-radius: 999px;
  border: 1.5px solid var(--bs-border-color);
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
  font-size: 0.875rem;
}

.cor-pronta--ativa {
  border-color: var(--primary);
  border-width: 2px;
  font-weight: 600;
}
</style>
