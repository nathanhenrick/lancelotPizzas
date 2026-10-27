<template>
  <div>
    <HeaderTemplate>Bebidas</HeaderTemplate>

    <section class="card p-3">
      <nav class="d-flex flex-wrap gap-2 justify-content-between mb-3 align-items-center" aria-label="Ações">
        <div class="d-flex flex-wrap align-items-center gap-2">
          <SearchInput v-model="searchQuery" @search="setQuery(searchQuery)" />
          <AdminFiltroSelect v-model="filtroSituacao" rotulo="Situação" :opcoes="OPCOES_SITUACAO" todas="Todas" />
          <AdminFiltroSelect v-model="filtroCena" rotulo="Na cena" :opcoes="OPCOES_CENA" todas="Todas" />
        </div>
        <PrimaryButton @click="state.show = true">
          <i class="bi bi-plus" aria-hidden="true" />
          Adicionar bebida
        </PrimaryButton>
      </nav>

      <ModalTemplate :open="state.show" largo @close="closeModal">
        <template #header>
          <h2 class="h5 m-0 fw-bold">{{ state.isEdit ? 'Editar Bebida' : 'Adicionar Bebida' }}</h2>
        </template>

        <template #content>
          <div class="row row-gap-3">
            <div class="col-md-7 d-flex flex-column gap-3">
              <AdminFormField v-slot="campo" rotulo="Nome" :erro="errors.nome" obrigatorio>
                <input :id="campo.id" v-model="state.nome" type="text" class="form-control" placeholder="Ex.: Refrigerante 2 L" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
              </AdminFormField>
              <AdminFormField v-slot="campo" rotulo="Descrição" :ajuda="`Aparece embaixo do nome no site. Ex.: Cola, guaraná ou laranja. (${state.descricao.length}/160)`">
                <input :id="campo.id" v-model="state.descricao" type="text" class="form-control" maxlength="160" :aria-describedby="campo.descritoPor">
              </AdminFormField>
              <AdminFormField v-slot="campo" rotulo="Preço" obrigatorio>
                <AdminPriceInput :id="campo.id" v-model="state.preco" />
              </AdminFormField>

              <AdminFormField v-slot="campo" rotulo="Como aparece ao lado da pizza" ajuda="O objeto 3D só aparece quando o cliente coloca a bebida no pedido, em tamanho real.">
                <select :id="campo.id" v-model="state.modelo" class="form-select" :aria-describedby="campo.descritoPor">
                  <option :value="null">Não mostrar na cena</option>
                  <option v-for="(info, chave) in MODELOS_BEBIDA" :key="chave" :value="chave">
                    {{ info.nome }} ({{ info.altura.toLocaleString('pt-BR') }} cm de altura)
                  </option>
                </select>
              </AdminFormField>

              <fieldset v-if="state.modelo && COM_ROTULO.includes(state.modelo)">
                <legend class="fw-semibold fs-6 mb-1">Logo da marca</legend>
                <p class="text-body-secondary small mb-2">
                  Aparece no rótulo da garrafa ou da lata. Use a logo da marca (de preferência PNG com fundo transparente);
                  ela é reduzida automaticamente. Sem logo, o rótulo leva o nome da bebida.
                </p>
                <div class="d-flex flex-wrap align-items-center gap-2">
                  <img v-if="state.logo" :src="state.logo" alt="Logo escolhida" class="logo-previa">
                  <label for="bebida-logo" class="btn btn-outline-secondary btn-sm mb-0">
                    <i class="bi bi-upload" aria-hidden="true" />
                    {{ state.logo ? 'Trocar logo' : 'Escolher logo' }}
                  </label>
                  <input id="bebida-logo" type="file" accept="image/*" class="visually-hidden" @change="escolherLogo">
                  <button v-if="state.logo" type="button" class="btn btn-link btn-sm text-danger" @click="state.logo = null">Remover logo</button>
                </div>
              </fieldset>

              <fieldset v-if="state.modelo">
                <legend class="fw-semibold fs-6 mb-1">{{ state.modelo === 'lata' ? 'Cor da lata' : 'Cor da bebida' }}</legend>
                <div class="d-flex flex-wrap align-items-center gap-2">
                  <button
                    v-for="c in CORES_BEBIDA"
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
                  <label for="bebida-cor" class="d-inline-flex align-items-center gap-2 small mb-0">
                    Outra:
                    <input id="bebida-cor" v-model="corHex" type="color" class="form-control form-control-color">
                  </label>
                </div>
              </fieldset>

              <div class="form-check">
                <input id="bebida-ativa" v-model="state.ativo" type="checkbox" class="form-check-input">
                <label for="bebida-ativa" class="form-check-label fw-semibold">Bebida ativa no cardápio</label>
              </div>
            </div>

            <div class="col-md-5">
              <p class="fw-semibold mb-1">Como fica ao lado da pizza</p>
              <AdminBebidaPreview :modelo="state.modelo" :cor="corNumero" :nome="state.nome" :logo="comRotulo ? state.logo : null" />
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
                <th>Na cena</th>
                <th>Status</th>
                <th style="width: 120px" class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!total">
                <td colspan="5" class="text-center text-body-secondary py-3">Nenhuma bebida encontrada.</td>
              </tr>
              <tr v-for="bebida in paginated" :key="bebida.id">
                <td>
                  <div class="fw-semibold text-primary">{{ bebida.nome }}</div>
                  <div v-if="bebida.descricao" class="small text-body-secondary">{{ bebida.descricao }}</div>
                </td>
                <td>{{ formatarPreco(bebida.preco) }}</td>
                <td>
                  <span v-if="bebida.modelo" class="amostra" :style="{ background: paraHex(bebida.cor ?? COR_BEBIDA_PADRAO) }" aria-hidden="true" />
                  {{ bebida.modelo ? MODELOS_BEBIDA[bebida.modelo].nome : 'Não aparece' }}
                </td>
                <td><AdminActiveBadge :ativo="bebida.ativo" /></td>
                <td class="text-end">
                  <AdminRowActions :nome="bebida.nome" @editar="editBebida(bebida)" @excluir="deleteBebida(bebida)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-md-none">
          <p v-if="!total" class="text-center py-3 text-body-secondary">Nenhuma bebida encontrada.</p>
          <div v-for="bebida in paginated" :key="bebida.id" class="card mb-2 p-3">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div>
                <div class="nome-destaque">{{ bebida.nome }}</div>
                <div v-if="bebida.descricao" class="small text-body-secondary">{{ bebida.descricao }}</div>
              </div>
              <AdminActiveBadge :ativo="bebida.ativo" />
            </div>
            <div class="mb-1">
              <span class="fw-semibold">Na cena: </span>
              <span v-if="bebida.modelo" class="amostra" :style="{ background: paraHex(bebida.cor ?? COR_BEBIDA_PADRAO) }" aria-hidden="true" />
              {{ bebida.modelo ? MODELOS_BEBIDA[bebida.modelo].nome : 'Não aparece' }}
            </div>
            <div class="d-flex justify-content-between align-items-center border-top pt-2">
              <span class="fw-bold">{{ formatarPreco(bebida.preco) }}</span>
              <AdminRowActions :nome="bebida.nome" @editar="editBebida(bebida)" @excluir="deleteBebida(bebida)" />
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
import type { Bebida, ModeloBebida } from '~/types/pizza'
import { CORES_BEBIDA, COR_BEBIDA_PADRAO, MODELOS_BEBIDA } from '~/data/bebidas'

const { $services } = useNuxtApp()
const cardapio = useCardapioStore()
const alerta = useAlerta()

useHead({ title: 'Bebidas' })
definePageMeta({ layout: 'admin' })

const state = reactive({
  show: false,
  isEdit: false,
  idEdit: 0,
  isLoading: false,
  nome: '',
  descricao: '',
  preco: 0,
  modelo: null as ModeloBebida | null,
  logo: null as string | null,
  ativo: true
})

const paraHex = (cor: number) => `#${cor.toString(16).padStart(6, '0')}`
const corHex = ref(paraHex(COR_BEBIDA_PADRAO))
const corNumero = computed(() => Number.parseInt(corHex.value.slice(1), 16))
const errors = reactive<Record<string, string>>({})

const COM_ROTULO: ModeloBebida[] = ['garrafa_2l', 'garrafa_1l', 'garrafa_500', 'lata', 'long_neck', 'cerveja_471', 'cerveja_1l']
const comRotulo = computed(() => Boolean(state.modelo && COM_ROTULO.includes(state.modelo)))

const OPCOES_SITUACAO = [{ valor: 'ativo', rotulo: 'Ativos' }, { valor: 'inativo', rotulo: 'Inativos' }]
const passaSituacao = (ativo: boolean, filtro: string) => !filtro || (filtro === 'ativo') === ativo
const OPCOES_CENA = [{ valor: 'com', rotulo: 'Com bebida 3D' }, { valor: 'sem', rotulo: 'Sem bebida 3D' }]
const filtroSituacao = ref('')
const filtroCena = ref('')

const {
  paginated, isLoading, searchQuery, setQuery, fetchData: fetchBebidas,
  page, pageSize, total, totalPages, rangeStart, rangeEnd, setPage, setPageSize
} = useCrud($services.bebidas, ['nome'], {
  filtro: (b) => passaSituacao(b.ativo, filtroSituacao.value) && (!filtroCena.value || (filtroCena.value === 'com') === Boolean(b.modelo)),
  reiniciarQuando: () => [filtroSituacao.value, filtroCena.value]
})

const LADO_MAXIMO_LOGO = 320

function escolherLogo(evento: Event) {
  const entrada = evento.target as HTMLInputElement
  const arquivo = entrada.files?.[0]
  entrada.value = ''
  if (!arquivo) return
  if (!arquivo.type.startsWith('image/')) {
    alerta.erro('Escolha um arquivo de imagem (PNG, JPG ou WebP).')
    return
  }
  const url = URL.createObjectURL(arquivo)
  const img = new Image()
  img.onload = () => {
    const k = Math.min(1, LADO_MAXIMO_LOGO / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.width * k))
    canvas.height = Math.max(1, Math.round(img.height * k))
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    state.logo = canvas.toDataURL('image/png')
    URL.revokeObjectURL(url)
  }
  img.onerror = () => {
    URL.revokeObjectURL(url)
    alerta.erro('Não foi possível ler essa imagem. Tente outro arquivo.')
  }
  img.src = url
}

watch(() => state.nome, () => { delete errors.nome })

function validate() {
  Object.keys(errors).forEach((chave) => delete errors[chave])
  if (!state.nome.trim()) errors.nome = 'O nome é obrigatório.'
  return alerta.validar(errors)
}

function closeModal() {
  state.show = false
  Object.assign(state, { isEdit: false, idEdit: 0, nome: '', descricao: '', preco: 0, modelo: null, logo: null, ativo: true })
  corHex.value = paraHex(COR_BEBIDA_PADRAO)
  Object.keys(errors).forEach((chave) => delete errors[chave])
}

async function apply() {
  if (!validate()) return
  const payload = {
    nome: state.nome.trim(),
    descricao: state.descricao.trim(),
    preco: state.preco,
    modelo: state.modelo,
    cor: state.modelo ? corNumero.value : null,
    logo: comRotulo.value ? state.logo : null,
    ativo: state.ativo
  }

  try {
    state.isLoading = true
    if (state.isEdit) {
      await $services.bebidas.update({ id: state.idEdit, ...payload })
      alerta.sucesso('Bebida atualizada.')
    } else {
      await $services.bebidas.save(payload)
      alerta.sucesso('Bebida adicionada.')
    }
    await Promise.all([fetchBebidas(), cardapio.carregar()])
    closeModal()
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível salvar a bebida.'))
  } finally {
    state.isLoading = false
  }
}

function editBebida(bebida: Bebida) {
  Object.assign(state, { isEdit: true, idEdit: bebida.id, nome: bebida.nome, descricao: bebida.descricao ?? '', preco: bebida.preco, modelo: bebida.modelo, logo: bebida.logo ?? null, ativo: bebida.ativo, show: true })
  corHex.value = paraHex(bebida.cor ?? COR_BEBIDA_PADRAO)
}

async function deleteBebida(bebida: Bebida) {
  if (!(await alerta.confirmar(`A bebida "${bebida.nome}" sai do cardápio. Esta ação não pode ser desfeita.`))) return
  try {
    await $services.bebidas.delete(bebida.id)
    await Promise.all([fetchBebidas(), cardapio.carregar()])
    alerta.sucesso('Bebida excluída.')
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível excluir a bebida.'))
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

.logo-previa {
  max-width: 96px;
  max-height: 64px;
  object-fit: contain;
  padding: 0.25rem;
  border-radius: 0.375rem;
  border: 1px solid var(--bs-border-color);
  background: #fff;
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
