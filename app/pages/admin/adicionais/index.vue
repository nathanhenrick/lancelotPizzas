<template>
  <div>
    <HeaderTemplate>Adicionais</HeaderTemplate>

    <section class="card p-3">
      <nav class="d-flex flex-wrap gap-2 justify-content-between mb-3 align-items-center" aria-label="Ações">
        <div class="d-flex flex-wrap align-items-center gap-2">
          <SearchInput v-model="searchQuery" @search="setQuery(searchQuery)" />
          <AdminFiltroSelect v-model="filtroSituacao" rotulo="Situação" :opcoes="OPCOES_SITUACAO" todas="Todos" />
        </div>
        <PrimaryButton @click="state.show = true">
          <i class="bi bi-plus" aria-hidden="true" />
          Adicionar adicional
        </PrimaryButton>
      </nav>

      <p class="text-body-secondary small">
        Extras que o cliente soma a um sabor da pizza (bacon, cheddar…). O valor é cobrado inteiro em cada sabor em que for marcado.
      </p>

      <ModalTemplate :open="state.show" @close="closeModal">
        <template #header>
          <h2 class="h5 m-0 fw-bold">{{ state.isEdit ? 'Editar Adicional' : 'Adicionar Adicional' }}</h2>
        </template>

        <template #content>
          <div class="d-flex flex-column gap-3">
            <AdminFormField v-slot="campo" rotulo="Nome" :erro="errors.nome" obrigatorio>
              <input :id="campo.id" v-model="state.nome" type="text" class="form-control" placeholder="Ex.: Bacon" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
            </AdminFormField>
            <AdminFormField v-slot="campo" rotulo="Preço" obrigatorio>
              <AdminPriceInput :id="campo.id" v-model="state.preco" />
            </AdminFormField>
            <div class="form-check">
              <input id="adicional-ativo" v-model="state.ativo" type="checkbox" class="form-check-input">
              <label for="adicional-ativo" class="form-check-label fw-semibold">Adicional ativo no cardápio</label>
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
                <th>Preço</th>
                <th>Status</th>
                <th style="width: 120px" class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!total">
                <td colspan="4" class="text-center text-body-secondary py-3">Nenhum adicional encontrado.</td>
              </tr>
              <tr v-for="adicional in paginated" :key="adicional.id">
                <td class="fw-semibold text-primary">{{ adicional.nome }}</td>
                <td>{{ formatarPreco(adicional.preco) }}</td>
                <td><AdminActiveBadge :ativo="adicional.ativo" /></td>
                <td class="text-end">
                  <AdminRowActions :nome="adicional.nome" @editar="editAdicional(adicional)" @excluir="deleteAdicional(adicional)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-md-none">
          <p v-if="!total" class="text-center py-3 text-body-secondary">Nenhum adicional encontrado.</p>
          <div v-for="adicional in paginated" :key="adicional.id" class="card mb-2 p-3">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div class="nome-destaque">{{ adicional.nome }}</div>
              <AdminActiveBadge :ativo="adicional.ativo" />
            </div>
            <div class="d-flex justify-content-between align-items-center border-top pt-2">
              <span class="fw-bold">{{ formatarPreco(adicional.preco) }}</span>
              <AdminRowActions :nome="adicional.nome" @editar="editAdicional(adicional)" @excluir="deleteAdicional(adicional)" />
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
import type { Adicional } from '~/types/pizza'

const { $services } = useNuxtApp()
const cardapio = useCardapioStore()
const alerta = useAlerta()

useHead({ title: 'Adicionais' })
definePageMeta({ layout: 'admin' })

const state = reactive({
  show: false,
  isEdit: false,
  idEdit: 0,
  isLoading: false,
  nome: '',
  preco: 0,
  ativo: true
})
const errors = reactive<Record<string, string>>({})

const OPCOES_SITUACAO = [{ valor: 'ativo', rotulo: 'Ativos' }, { valor: 'inativo', rotulo: 'Inativos' }]
const filtroSituacao = ref('')

const {
  paginated, isLoading, searchQuery, setQuery, fetchData: fetchAdicionais,
  page, pageSize, total, totalPages, rangeStart, rangeEnd, setPage, setPageSize
} = useCrud($services.adicionais, ['nome'], {
  filtro: (a) => !filtroSituacao.value || (filtroSituacao.value === 'ativo') === a.ativo,
  reiniciarQuando: () => [filtroSituacao.value]
})

watch(() => state.nome, () => { delete errors.nome })

function validate() {
  Object.keys(errors).forEach((chave) => delete errors[chave])
  if (!state.nome.trim()) errors.nome = 'O nome é obrigatório.'
  return alerta.validar(errors)
}

function closeModal() {
  state.show = false
  Object.assign(state, { isEdit: false, idEdit: 0, nome: '', preco: 0, ativo: true })
  Object.keys(errors).forEach((chave) => delete errors[chave])
}

async function apply() {
  if (!validate()) return
  const payload = { nome: state.nome.trim(), preco: state.preco, ativo: state.ativo }

  try {
    state.isLoading = true
    if (state.isEdit) {
      await $services.adicionais.update({ id: state.idEdit, ...payload })
      alerta.sucesso('Adicional atualizado.')
    } else {
      await $services.adicionais.save(payload)
      alerta.sucesso('Adicional adicionado.')
    }
    await Promise.all([fetchAdicionais(), cardapio.carregar()])
    closeModal()
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível salvar o adicional.'))
  } finally {
    state.isLoading = false
  }
}

function editAdicional(adicional: Adicional) {
  Object.assign(state, { isEdit: true, idEdit: adicional.id, nome: adicional.nome, preco: adicional.preco, ativo: adicional.ativo, show: true })
}

async function deleteAdicional(adicional: Adicional) {
  if (!(await alerta.confirmar(`O adicional "${adicional.nome}" sai do cardápio. Esta ação não pode ser desfeita.`))) return
  try {
    await $services.adicionais.delete(adicional.id)
    await Promise.all([fetchAdicionais(), cardapio.carregar()])
    alerta.sucesso('Adicional excluído.')
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível excluir o adicional.'))
  }
}
</script>
