<template>
  <div>
    <HeaderTemplate>Sabores</HeaderTemplate>

    <section class="card p-3">
      <nav class="d-flex flex-wrap gap-2 justify-content-between mb-3 align-items-center" aria-label="Ações">
        <div class="d-flex flex-wrap align-items-center gap-2">
          <SearchInput v-model="searchQuery" @search="setQuery(searchQuery)" />
          <AdminFiltroSelect v-model="filtroSituacao" rotulo="Situação" :opcoes="OPCOES_SITUACAO" todas="Todas" />
          <AdminFiltroSelect v-model="filtroTipo" rotulo="Tipo" :opcoes="OPCOES_TIPO" todas="Todos" />
          <AdminFiltroSelect v-model="filtroFaixa" rotulo="Faixa" :opcoes="opcoesFaixa" todas="Todas" />
        </div>
        <PrimaryButton @click="state.show = true">
          <i class="bi bi-plus" aria-hidden="true" />
          Adicionar sabor
        </PrimaryButton>
      </nav>

      <ModalTemplate :open="state.show" largo @close="closeModal">
        <template #header>
          <h2 class="h5 m-0 fw-bold">{{ state.isEdit ? 'Editar Sabor' : 'Adicionar Sabor' }}</h2>
        </template>

        <template #content>
          <div class="row row-gap-3">
            <div class="col-md-7 d-flex flex-column gap-3">
              <AdminFormField v-slot="campo" rotulo="Nome" :erro="errors.nome" obrigatorio>
                <input :id="campo.id" v-model="state.nome" type="text" class="form-control" placeholder="Ex.: Calabresa" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
              </AdminFormField>

              <AdminFormField v-slot="campo" rotulo="Descrição" ajuda="Aparece na lista de sabores do site. Em branco, usa os nomes dos ingredientes.">
                <input :id="campo.id" v-model="state.descricao" type="text" class="form-control" :placeholder="descricaoAutomatica" :aria-describedby="campo.descritoPor">
              </AdminFormField>

              <AdminFormField v-slot="campo" rotulo="Tipo de pizza" ajuda="Pizzas doces aparecem numa aba separada ao escolher o sabor.">
                <select :id="campo.id" v-model="state.tipo" class="form-select" :aria-describedby="campo.descritoPor">
                  <option value="salgada">Salgada</option>
                  <option value="doce">Doce</option>
                </select>
              </AdminFormField>

              <AdminFormField v-slot="campo" rotulo="Faixa de preço" obrigatorio ajuda="Os valores de cada faixa ficam em Tamanhos e preços.">
                <select :id="campo.id" v-model="state.faixa" class="form-select" :aria-describedby="campo.descritoPor">
                  <option v-for="(faixa, chave) in cardapio.faixas" :key="chave" :value="chave">
                    {{ faixa.nome }} ({{ formatarPreco(faixa.g) }} na {{ nomeMaior }})
                  </option>
                </select>
              </AdminFormField>

              <fieldset>
                <legend class="fw-semibold fs-6 mb-1">Ingredientes visuais</legend>
                <p class="text-body-secondary small mb-2">O que aparece desenhado na pizza. O queijo de base já vem em todas; nas doces, cubra com chocolate.</p>
                <div class="ingredientes">
                  <div v-for="(ing, id) in INGREDIENTES" :key="id" class="form-check">
                    <input :id="`ing-${id}`" v-model="state.ingredientes" class="form-check-input" type="checkbox" :value="id">
                    <label :for="`ing-${id}`" class="form-check-label">{{ ing.nome }}</label>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend class="fw-semibold fs-6 mb-1">Adicionais deste sabor</legend>
                <p class="text-body-secondary small mb-2">
                  Extras que o cliente pode somar a este sabor. Cadastre-os em Adicionais.
                </p>
                <p v-if="!cardapio.adicionais.length" class="small mb-0">Nenhum adicional cadastrado ainda.</p>
                <div class="ingredientes">
                  <div v-for="extra in cardapio.adicionais" :key="extra.id" class="form-check">
                    <input :id="`add-${extra.id}`" v-model="state.adicionais" class="form-check-input" type="checkbox" :value="extra.id">
                    <label :for="`add-${extra.id}`" class="form-check-label">{{ extra.nome }} ({{ formatarPreco(extra.preco) }})</label>
                  </div>
                </div>
              </fieldset>

              <div class="form-check">
                <input id="sabor-ativo" v-model="state.ativo" type="checkbox" class="form-check-input">
                <label for="sabor-ativo" class="form-check-label fw-semibold">Sabor ativo no cardápio</label>
              </div>
            </div>

            <div class="col-md-5">
              <p class="fw-semibold mb-1">Como fica na pizza</p>
              <AdminSaborPreview :ingredientes="state.ingredientes" :nome="state.nome" />
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
                <th>Tipo</th>
                <th>Faixa</th>
                <th>Ingredientes</th>
                <th>Status</th>
                <th style="width: 120px" class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!total">
                <td colspan="6" class="text-center text-body-secondary py-3">Nenhum sabor encontrado.</td>
              </tr>
              <tr v-for="sabor in paginated" :key="sabor.id">
                <td class="fw-semibold text-primary">{{ sabor.nome }}</td>
                <td>{{ sabor.tipo === 'doce' ? 'Doce' : 'Salgada' }}</td>
                <td>{{ cardapio.faixas[sabor.faixa].nome }}</td>
                <td>{{ nomesIngredientes(sabor.ingredientes) || 'Só queijo' }}</td>
                <td><AdminActiveBadge :ativo="sabor.ativo" /></td>
                <td class="text-end">
                  <AdminRowActions :nome="sabor.nome" @editar="editSabor(sabor)" @excluir="deleteSabor(sabor)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-md-none">
          <p v-if="!total" class="text-center py-3 text-body-secondary">Nenhum sabor encontrado.</p>
          <div v-for="sabor in paginated" :key="sabor.id" class="card mb-2 p-3">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div class="nome-destaque">{{ sabor.nome }}</div>
              <AdminActiveBadge :ativo="sabor.ativo" />
            </div>
            <div class="mb-1"><span class="fw-semibold">Tipo: </span>{{ sabor.tipo === 'doce' ? 'Doce' : 'Salgada' }}</div>
            <div class="mb-1"><span class="fw-semibold">Faixa: </span>{{ cardapio.faixas[sabor.faixa].nome }}</div>
            <div><span class="fw-semibold">Ingredientes: </span>{{ nomesIngredientes(sabor.ingredientes) || 'Só queijo' }}</div>
            <div class="mt-2 d-flex justify-content-end border-top pt-2">
              <AdminRowActions :nome="sabor.nome" @editar="editSabor(sabor)" @excluir="deleteSabor(sabor)" />
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
import type { FaixaId, Sabor, TipoSabor } from '~/types/pizza'
import { INGREDIENTES } from '~/data/ingredientes'

const { $services } = useNuxtApp()
const cardapio = useCardapioStore()
const alerta = useAlerta()

useHead({ title: 'Sabores' })
definePageMeta({ layout: 'admin' })

const state = reactive({
  show: false,
  isEdit: false,
  idEdit: 0,
  isLoading: false,
  nome: '',
  descricao: '',
  tipo: 'salgada' as TipoSabor,
  faixa: 'trad' as FaixaId,
  ingredientes: [] as string[],
  adicionais: [] as number[],
  ativo: true
})
const errors = reactive<Record<string, string>>({})

const OPCOES_SITUACAO = [{ valor: 'ativo', rotulo: 'Ativos' }, { valor: 'inativo', rotulo: 'Inativos' }]
const passaSituacao = (ativo: boolean, filtro: string) => !filtro || (filtro === 'ativo') === ativo
const filtroSituacao = ref('')
const filtroFaixa = ref('')
const OPCOES_TIPO = [{ valor: 'salgada', rotulo: 'Salgadas' }, { valor: 'doce', rotulo: 'Doces' }]
const filtroTipo = ref('')
const opcoesFaixa = computed(() => Object.entries(cardapio.faixas).map(([valor, f]) => ({ valor, rotulo: f.nome })))

const {
  paginated, isLoading, searchQuery, setQuery, fetchData: fetchSabores,
  page, pageSize, total, totalPages, rangeStart, rangeEnd, setPage, setPageSize
} = useCrud($services.sabores, ['nome', 'descricao'], {
  filtro: (s) => passaSituacao(s.ativo, filtroSituacao.value) && (!filtroFaixa.value || s.faixa === filtroFaixa.value) && (!filtroTipo.value || s.tipo === filtroTipo.value),
  reiniciarQuando: () => [filtroSituacao.value, filtroFaixa.value, filtroTipo.value]
})

const nomeMaior = computed(() => cardapio.tamanhos[cardapio.tamanhos.length - 1]?.nome ?? '')
const nomesIngredientes = (ids: string[]) => ids.map((id) => INGREDIENTES[id]?.nome ?? id).join(', ')
const descricaoAutomatica = computed(() => ['Queijo', ...state.ingredientes.map((id) => (INGREDIENTES[id]?.nome ?? id).toLowerCase())].join(', '))

watch(() => state.nome, () => { delete errors.nome })

function validate() {
  Object.keys(errors).forEach((chave) => delete errors[chave])
  if (!state.nome.trim()) errors.nome = 'O nome é obrigatório.'
  return alerta.validar(errors)
}

function resetForm() {
  Object.assign(state, { isEdit: false, idEdit: 0, nome: '', descricao: '', tipo: 'salgada', faixa: 'trad', ingredientes: [], adicionais: [], ativo: true })
  Object.keys(errors).forEach((chave) => delete errors[chave])
}

function closeModal() {
  state.show = false
  resetForm()
}

async function apply() {
  if (!validate()) return

  const payload = {
    nome: state.nome.trim(),
    descricao: state.descricao.trim() || descricaoAutomatica.value,
    tipo: state.tipo,
    faixa: state.faixa,
    ingredientes: [...state.ingredientes],
    adicionais: [...state.adicionais],
    ativo: state.ativo
  }

  try {
    state.isLoading = true
    if (state.isEdit) {
      await $services.sabores.update({ id: state.idEdit, ...payload })
      alerta.sucesso('Sabor atualizado.')
    } else {
      await $services.sabores.save(payload)
      alerta.sucesso('Sabor adicionado.')
    }
    await Promise.all([fetchSabores(), cardapio.carregar()])
    closeModal()
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível salvar o sabor.'))
  } finally {
    state.isLoading = false
  }
}

function editSabor(sabor: Sabor) {
  Object.assign(state, {
    isEdit: true,
    idEdit: sabor.id,
    nome: sabor.nome,
    descricao: sabor.descricao,
    tipo: sabor.tipo ?? 'salgada',
    faixa: sabor.faixa,
    ingredientes: [...sabor.ingredientes],
    adicionais: [...(sabor.adicionais ?? [])],
    ativo: sabor.ativo,
    show: true
  })
}

async function deleteSabor(sabor: Sabor) {
  if (!(await alerta.confirmar(`O sabor "${sabor.nome}" sai do cardápio. Esta ação não pode ser desfeita.`))) return
  try {
    await $services.sabores.delete(sabor.id)
    await Promise.all([fetchSabores(), cardapio.carregar()])
    alerta.sucesso('Sabor excluído.')
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível excluir o sabor.'))
  }
}
</script>

<style scoped>
.ingredientes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.375rem 0.75rem;
}
</style>
