<template>
  <div>
    <HeaderTemplate>
      Usuários
      <template #descricao>Quem pode entrar no painel.</template>
    </HeaderTemplate>

    <section class="card p-3">
      <nav class="d-flex flex-wrap gap-2 justify-content-between mb-3 align-items-center" aria-label="Ações">
        <div class="d-flex flex-wrap align-items-center gap-2">
          <SearchInput v-model="searchQuery" placeholder="Pesquisar por nome ou e-mail" @search="setQuery(searchQuery)" />
          <AdminFiltroSelect v-model="filtroAcesso" rotulo="Acesso" :opcoes="OPCOES_ACESSO" todas="Todos" />
        </div>
        <PrimaryButton @click="state.show = true">
          <i class="bi bi-plus" aria-hidden="true" />
          Adicionar usuário
        </PrimaryButton>
      </nav>

      <ModalTemplate :open="state.show" @close="closeModal">
        <template #header>
          <h2 class="h5 m-0 fw-bold">{{ state.isEdit ? 'Editar Usuário' : 'Adicionar Usuário' }}</h2>
        </template>

        <template #content>
          <div class="d-flex flex-column gap-3">
            <AdminFormField v-slot="campo" rotulo="Nome" :erro="errors.nome" obrigatorio>
              <input :id="campo.id" v-model="state.nome" type="text" class="form-control" autocomplete="off" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
            </AdminFormField>
            <AdminFormField v-slot="campo" rotulo="E-mail" :erro="errors.email" obrigatorio>
              <input :id="campo.id" v-model="state.email" type="email" class="form-control" autocomplete="off" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
            </AdminFormField>
            <AdminFormField
              v-slot="campo"
              rotulo="Senha"
              :erro="errors.senha"
              :obrigatorio="!state.isEdit"
              :ajuda="state.isEdit ? 'Em branco, a senha atual continua valendo.' : 'Pelo menos 8 caracteres.'"
            >
              <input :id="campo.id" v-model="state.senha" type="password" class="form-control" autocomplete="new-password" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
            </AdminFormField>
            <AdminFormField v-slot="campo" rotulo="Papel" ajuda="Dono faz tudo; atendente só cuida dos pedidos.">
              <select :id="campo.id" v-model="state.papel" class="form-select" :disabled="editandoASiMesmo">
                <option value="atendente">Atendente</option>
                <option value="dono">Dono</option>
              </select>
            </AdminFormField>
            <div class="form-check">
              <input id="usuario-ativo" v-model="state.ativo" type="checkbox" class="form-check-input" :disabled="editandoASiMesmo">
              <label for="usuario-ativo" class="form-check-label fw-semibold">Acesso liberado</label>
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
                <th>E-mail</th>
                <th>Papel</th>
                <th>Status</th>
                <th style="width: 120px" class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!total">
                <td colspan="5" class="text-center text-body-secondary py-3">Nenhum usuário encontrado.</td>
              </tr>
              <tr v-for="usuario in paginated" :key="usuario.id">
                <td class="fw-semibold text-primary">
                  {{ usuario.nome }}
                  <span v-if="usuario.id === auth.usuario?.id" class="small text-body-secondary fw-normal">(você)</span>
                </td>
                <td>{{ usuario.email }}</td>
                <td>{{ ROTULO_PAPEL[usuario.papel] }}</td>
                <td><AdminActiveBadge :ativo="usuario.status === 'ATIVO'" /></td>
                <td class="text-end">
                  <AdminRowActions :nome="usuario.nome" @editar="editUsuario(usuario)" @excluir="deleteUsuario(usuario)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-md-none">
          <p v-if="!total" class="text-center py-3 text-body-secondary">Nenhum usuário encontrado.</p>
          <div v-for="usuario in paginated" :key="usuario.id" class="card mb-2 p-3">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div class="nome-destaque">{{ usuario.nome }}</div>
              <AdminActiveBadge :ativo="usuario.status === 'ATIVO'" />
            </div>
            <div class="d-flex justify-content-between align-items-center border-top pt-2 gap-2">
              <span class="small text-break">{{ usuario.email }} · {{ ROTULO_PAPEL[usuario.papel] }}</span>
              <AdminRowActions :nome="usuario.nome" @editar="editUsuario(usuario)" @excluir="deleteUsuario(usuario)" />
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
import type { PapelUsuario, Usuario } from '~/types/pizza'

const { $services } = useNuxtApp()
const auth = useAuthStore()
const alerta = useAlerta()

useHead({ title: 'Usuários' })
definePageMeta({ layout: 'admin' })

const state = reactive({
  show: false,
  isEdit: false,
  idEdit: 0,
  isLoading: false,
  nome: '',
  email: '',
  senha: '',
  papel: 'atendente' as PapelUsuario,
  ativo: true
})
const errors = reactive<Record<string, string>>({})

const ROTULO_PAPEL: Record<PapelUsuario, string> = { dono: 'Dono', atendente: 'Atendente' }
const OPCOES_ACESSO = [{ valor: 'ATIVO', rotulo: 'Liberado' }, { valor: 'INATIVO', rotulo: 'Bloqueado' }]
const filtroAcesso = ref('')

const {
  paginated, isLoading, searchQuery, setQuery, fetchData: fetchUsuarios,
  page, pageSize, total, totalPages, rangeStart, rangeEnd, setPage, setPageSize
} = useCrud($services.usuarios, ['nome', 'email'], {
  filtro: (u) => !filtroAcesso.value || u.status === filtroAcesso.value,
  reiniciarQuando: () => filtroAcesso.value
})

const editandoASiMesmo = computed(() => state.isEdit && state.idEdit === auth.usuario?.id)

watch(() => state.nome, () => { delete errors.nome })
watch(() => state.email, () => { delete errors.email })
watch(() => state.senha, () => { delete errors.senha })

function validate() {
  Object.keys(errors).forEach((chave) => delete errors[chave])
  if (!state.nome.trim()) errors.nome = 'O nome é obrigatório.'
  if (!/^\S+@\S+\.\S+$/.test(state.email.trim())) errors.email = 'Informe um e-mail válido.'
  if (!state.isEdit && !state.senha) errors.senha = 'A senha é obrigatória.'
  else if (state.senha && state.senha.length < 8) errors.senha = 'A senha deve ter pelo menos 8 caracteres.'
  return alerta.validar(errors)
}

function closeModal() {
  state.show = false
  Object.assign(state, { isEdit: false, idEdit: 0, nome: '', email: '', senha: '', papel: 'atendente', ativo: true })
  Object.keys(errors).forEach((chave) => delete errors[chave])
}

async function apply() {
  if (!validate()) return
  const payload = {
    nome: state.nome.trim(),
    email: state.email.trim(),
    status: state.ativo ? 'ATIVO' as const : 'INATIVO' as const,
    papel: state.papel,
    ...(state.senha ? { senha: state.senha } : {})
  }

  try {
    state.isLoading = true
    if (state.isEdit) {
      await $services.usuarios.update({ id: state.idEdit, ...payload })
      alerta.sucesso('Usuário atualizado.')
    } else {
      await $services.usuarios.save(payload)
      alerta.sucesso('Usuário adicionado.')
    }
    await fetchUsuarios()
    closeModal()
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível salvar o usuário.'))
  } finally {
    state.isLoading = false
  }
}

function editUsuario(usuario: Usuario) {
  Object.assign(state, {
    isEdit: true,
    idEdit: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    senha: '',
    papel: usuario.papel,
    ativo: usuario.status === 'ATIVO',
    show: true
  })
}

async function deleteUsuario(usuario: Usuario) {
  if (!(await alerta.confirmar(`${usuario.nome} perde o acesso ao painel. Esta ação não pode ser desfeita.`))) return
  try {
    await $services.usuarios.delete(usuario.id)
    await fetchUsuarios()
    alerta.sucesso('Usuário excluído.')
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível excluir o usuário.'))
  }
}
</script>
