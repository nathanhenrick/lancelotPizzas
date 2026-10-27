<template>
  <div>
    <HeaderTemplate>Esfirras</HeaderTemplate>

    <section class="card p-3">
      <nav class="d-flex flex-wrap gap-2 justify-content-between mb-3 align-items-center" aria-label="Ações">
        <div class="d-flex flex-wrap align-items-center gap-2">
          <SearchInput v-model="searchQuery" @search="setQuery(searchQuery)" />
          <AdminFiltroSelect v-model="filtroSituacao" rotulo="Situação" :opcoes="OPCOES_SITUACAO" todas="Todas" />
          <AdminFiltroSelect v-model="filtroTipo" rotulo="Tipo" :opcoes="OPCOES_TIPO" todas="Todos" />
        </div>
        <PrimaryButton @click="state.show = true">
          <i class="bi bi-plus" aria-hidden="true" />
          Adicionar esfirra
        </PrimaryButton>
      </nav>

      <ModalTemplate :open="state.show" largo @close="closeModal">
        <template #header>
          <h2 class="h5 m-0 fw-bold">{{ state.isEdit ? 'Editar Esfirra' : 'Adicionar Esfirra' }}</h2>
        </template>

        <template #content>
          <div class="row row-gap-3">
            <div class="col-md-7 d-flex flex-column gap-3">
              <AdminFormField v-slot="campo" rotulo="Nome" :erro="errors.nome" obrigatorio>
                <input :id="campo.id" v-model="state.nome" type="text" class="form-control" placeholder="Ex.: Esfirra de carne" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
              </AdminFormField>

              <AdminFormField v-slot="campo" rotulo="Descrição" ajuda="Aparece na lista de esfirras do site. Em branco, usa os nomes dos ingredientes.">
                <input :id="campo.id" v-model="state.descricao" type="text" class="form-control" maxlength="160" :placeholder="descricaoAutomatica" :aria-describedby="campo.descritoPor">
              </AdminFormField>

              <AdminFormField v-slot="campo" rotulo="Tipo de esfirra" ajuda="Esfirras doces aparecem numa aba separada. Só as salgadas aceitam tirar ingredientes e somar adicionais.">
                <select :id="campo.id" v-model="state.tipo" class="form-select" :aria-describedby="campo.descritoPor">
                  <option value="salgada">Salgada</option>
                  <option value="doce">Doce</option>
                </select>
              </AdminFormField>

              <fieldset>
                <legend class="fw-semibold fs-6 mb-1">Tamanhos e preços <span class="text-danger" aria-hidden="true">*</span></legend>
                <p class="text-body-secondary small mb-2">Cada tamanho tem o seu preço por unidade. Com um só, o cliente não precisa escolher.</p>
                <div class="d-flex flex-column gap-2">
                  <div v-for="(t, i) in state.tamanhos" :key="i" class="row g-2 align-items-center">
                    <div class="col-6">
                      <input v-model="t.nome" type="text" class="form-control" maxlength="30" placeholder="Ex.: Grande" :aria-label="`Nome do tamanho ${i + 1}`">
                    </div>
                    <div class="col">
                      <AdminPriceInput v-model="t.preco" :rotulo="`Preço do tamanho ${i + 1}`" />
                    </div>
                    <div class="col-auto">
                      <button type="button" class="btn btn-outline-danger btn-sm" :disabled="state.tamanhos.length === 1" :aria-label="`Remover o tamanho ${t.nome || i + 1}`" @click="state.tamanhos.splice(i, 1)">
                        <i class="bi bi-trash" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
                <button v-if="state.tamanhos.length < 6" type="button" class="btn btn-outline-secondary btn-sm mt-2" @click="state.tamanhos.push({ nome: '', preco: 0 })">
                  <i class="bi bi-plus" aria-hidden="true" /> Adicionar tamanho
                </button>
                <p v-if="errors.tamanhos" class="text-danger small mt-1 mb-0" role="alert">{{ errors.tamanhos }}</p>
              </fieldset>

              <fieldset>
                <legend class="fw-semibold fs-6 mb-1">Ingredientes</legend>
                <p class="text-body-secondary small mb-2">O que leva o recheio. Também entram na descrição do site.</p>
                <div class="ingredientes">
                  <div v-for="(ing, id) in INGREDIENTES" :key="id" class="form-check">
                    <input :id="`ing-${id}`" v-model="state.ingredientes" class="form-check-input" type="checkbox" :value="id">
                    <label :for="`ing-${id}`" class="form-check-label">{{ ing.nome }}</label>
                  </div>
                </div>
              </fieldset>

              <fieldset v-if="state.tipo === 'salgada'">
                <legend class="fw-semibold fs-6 mb-1">Adicionais desta esfirra</legend>
                <p class="text-body-secondary small mb-2">Extras que o cliente pode somar (cobrados por unidade). Cadastre-os em Adicionais.</p>
                <p v-if="!cardapio.adicionais.length" class="small mb-0">Nenhum adicional cadastrado ainda.</p>
                <div class="ingredientes">
                  <div v-for="extra in cardapio.adicionais" :key="extra.id" class="form-check">
                    <input :id="`add-${extra.id}`" v-model="state.adicionais" class="form-check-input" type="checkbox" :value="extra.id">
                    <label :for="`add-${extra.id}`" class="form-check-label">{{ extra.nome }} ({{ formatarPreco(extra.preco) }})</label>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend class="fw-semibold fs-6 mb-1">Cor do recheio</legend>
                <p class="text-body-secondary small mb-2">A cor que aparece no recheio da esfirra 3D.</p>
                <div class="d-flex flex-wrap align-items-center gap-2">
                  <button
                    v-for="c in CORES_ESFIRRA"
                    :key="c.cor"
                    type="button"
                    class="cor-pronta"
                    :class="{ 'cor-pronta--ativa': corHex === paraHex(c.cor) }"
                    :aria-pressed="corHex === paraHex(c.cor)"
                    @click="corHex = paraHex(c.cor)"
                  >
                    <span class="amostra" :style="{ background: paraHex(c.cor) }" aria-hidden="true" />
                    {{ c.nome }}
                  </button>
                  <label for="esfirra-cor" class="d-inline-flex align-items-center gap-2 small mb-0">
                    Outra:
                    <input id="esfirra-cor" v-model="corHex" type="color" class="form-control form-control-color">
                  </label>
                </div>
              </fieldset>

              <div class="form-check">
                <input id="esfirra-ativa" v-model="state.ativo" type="checkbox" class="form-check-input">
                <label for="esfirra-ativa" class="form-check-label fw-semibold">Esfirra ativa no cardápio</label>
              </div>
            </div>

            <div class="col-md-5">
              <p class="fw-semibold mb-1">Como fica na tábua</p>
              <AdminEsfirraPreview :cor="corNumero" :nome="state.nome" />
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
                <th>Tamanhos e preços</th>
                <th>Ingredientes</th>
                <th>Status</th>
                <th style="width: 120px" class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!total">
                <td colspan="6" class="text-center text-body-secondary py-3">Nenhuma esfirra encontrada.</td>
              </tr>
              <tr v-for="esfirra in paginated" :key="esfirra.id">
                <td>
                  <div class="fw-semibold text-primary">{{ esfirra.nome }}</div>
                  <div v-if="esfirra.descricao" class="small text-body-secondary">{{ esfirra.descricao }}</div>
                </td>
                <td>{{ esfirra.tipo === 'doce' ? 'Doce' : 'Salgada' }}</td>
                <td>{{ resumoTamanhos(esfirra) }}</td>
                <td>{{ nomesIngredientes(esfirra.ingredientes) || '—' }}</td>
                <td><AdminActiveBadge :ativo="esfirra.ativo" /></td>
                <td class="text-end">
                  <AdminRowActions :nome="esfirra.nome" @editar="editEsfirra(esfirra)" @excluir="deleteEsfirra(esfirra)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-md-none">
          <p v-if="!total" class="text-center py-3 text-body-secondary">Nenhuma esfirra encontrada.</p>
          <div v-for="esfirra in paginated" :key="esfirra.id" class="card mb-2 p-3">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div class="nome-destaque">{{ esfirra.nome }}</div>
              <AdminActiveBadge :ativo="esfirra.ativo" />
            </div>
            <div class="mb-1"><span class="fw-semibold">Tipo: </span>{{ esfirra.tipo === 'doce' ? 'Doce' : 'Salgada' }}</div>
            <div class="mb-1"><span class="fw-semibold">Tamanhos: </span>{{ resumoTamanhos(esfirra) }}</div>
            <div><span class="fw-semibold">Ingredientes: </span>{{ nomesIngredientes(esfirra.ingredientes) || '—' }}</div>
            <div class="mt-2 d-flex justify-content-end border-top pt-2">
              <AdminRowActions :nome="esfirra.nome" @editar="editEsfirra(esfirra)" @excluir="deleteEsfirra(esfirra)" />
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
import type { Esfirra, TipoSabor } from '~/types/pizza'
import { COR_ESFIRRA_PADRAO, CORES_ESFIRRA } from '~/data/esfirras'
import { INGREDIENTES } from '~/data/ingredientes'

const { $services } = useNuxtApp()
const cardapio = useCardapioStore()
const alerta = useAlerta()

useHead({ title: 'Esfirras' })
definePageMeta({ layout: 'admin' })

const tamanhoVazio = () => ({ nome: 'Unidade', preco: 0 })

const state = reactive({
  show: false,
  isEdit: false,
  idEdit: 0,
  isLoading: false,
  nome: '',
  tipo: 'salgada' as TipoSabor,
  descricao: '',
  adicionais: [] as number[],
  tamanhos: [tamanhoVazio()] as { nome: string, preco: number }[],
  ingredientes: [] as string[],
  ativo: true
})
const errors = reactive<Record<string, string>>({})

const paraHex = (cor: number) => `#${cor.toString(16).padStart(6, '0')}`
const corHex = ref(paraHex(COR_ESFIRRA_PADRAO))
const corNumero = computed(() => Number.parseInt(corHex.value.slice(1), 16))

const OPCOES_SITUACAO = [{ valor: 'ativo', rotulo: 'Ativas' }, { valor: 'inativo', rotulo: 'Inativas' }]
const filtroSituacao = ref('')
const OPCOES_TIPO = [{ valor: 'salgada', rotulo: 'Salgadas' }, { valor: 'doce', rotulo: 'Doces' }]
const filtroTipo = ref('')

const {
  paginated, isLoading, searchQuery, setQuery, fetchData: fetchEsfirras,
  page, pageSize, total, totalPages, rangeStart, rangeEnd, setPage, setPageSize
} = useCrud($services.esfirras, ['nome', 'descricao'], {
  filtro: (e) => (!filtroSituacao.value || (filtroSituacao.value === 'ativo') === e.ativo) && (!filtroTipo.value || e.tipo === filtroTipo.value),
  reiniciarQuando: () => [filtroSituacao.value, filtroTipo.value]
})

const nomesIngredientes = (ids: string[] = []) => ids.map((id) => INGREDIENTES[id]?.nome ?? id).join(', ')
const descricaoAutomatica = computed(() => nomesIngredientes(state.ingredientes) || 'Ex.: Carne temperada, aberta')
const resumoTamanhos = (e: Esfirra) =>
  tamanhosDaEsfirra(e).map((t) => (e.tamanhos?.length ? `${t.nome} ${formatarPreco(t.preco)}` : formatarPreco(t.preco))).join(' · ')

watch(() => state.nome, () => { delete errors.nome })

function validate() {
  Object.keys(errors).forEach((chave) => delete errors[chave])
  if (!state.nome.trim()) errors.nome = 'O nome é obrigatório.'
  const nomes = state.tamanhos.map((t) => t.nome.trim().toLowerCase())
  if (nomes.some((n) => !n)) errors.tamanhos = 'Dê um nome a cada tamanho.'
  else if (new Set(nomes).size !== nomes.length) errors.tamanhos = 'Os tamanhos não podem ter o mesmo nome.'
  return alerta.validar(errors)
}

function closeModal() {
  state.show = false
  Object.assign(state, { isEdit: false, idEdit: 0, nome: '', tipo: 'salgada', descricao: '', adicionais: [], tamanhos: [tamanhoVazio()], ingredientes: [], ativo: true })
  corHex.value = paraHex(COR_ESFIRRA_PADRAO)
  Object.keys(errors).forEach((chave) => delete errors[chave])
}

async function apply() {
  if (!validate()) return
  const tamanhos = state.tamanhos.map((t) => ({ nome: t.nome.trim(), preco: t.preco }))
  const payload = {
    nome: state.nome.trim(),
    tipo: state.tipo,
    descricao: state.descricao.trim() || nomesIngredientes(state.ingredientes),
    preco: tamanhos[0]!.preco,
    tamanhos,
    ingredientes: [...state.ingredientes],
    adicionais: state.tipo === 'salgada' ? [...state.adicionais] : [],
    cor: corNumero.value,
    ativo: state.ativo
  }

  try {
    state.isLoading = true
    if (state.isEdit) {
      await $services.esfirras.update({ id: state.idEdit, ...payload })
      alerta.sucesso('Esfirra atualizada.')
    } else {
      await $services.esfirras.save(payload)
      alerta.sucesso('Esfirra adicionada.')
    }
    await Promise.all([fetchEsfirras(), cardapio.carregar()])
    closeModal()
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível salvar a esfirra.'))
  } finally {
    state.isLoading = false
  }
}

function editEsfirra(esfirra: Esfirra) {
  Object.assign(state, {
    isEdit: true,
    idEdit: esfirra.id,
    nome: esfirra.nome,
    tipo: esfirra.tipo ?? 'salgada',
    descricao: esfirra.descricao ?? '',
    adicionais: [...(esfirra.adicionais ?? [])],
    tamanhos: tamanhosDaEsfirra(esfirra).map((t) => ({ ...t })),
    ingredientes: [...(esfirra.ingredientes ?? [])],
    ativo: esfirra.ativo,
    show: true
  })
  corHex.value = paraHex(esfirra.cor ?? COR_ESFIRRA_PADRAO)
}

async function deleteEsfirra(esfirra: Esfirra) {
  if (!(await alerta.confirmar(`A esfirra "${esfirra.nome}" sai do cardápio. Esta ação não pode ser desfeita.`))) return
  try {
    await $services.esfirras.delete(esfirra.id)
    await Promise.all([fetchEsfirras(), cardapio.carregar()])
    alerta.sucesso('Esfirra excluída.')
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível excluir a esfirra.'))
  }
}
</script>

<style scoped>
.ingredientes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.375rem 0.75rem;
}

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
