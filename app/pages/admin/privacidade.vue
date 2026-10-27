<template>
  <div>
    <HeaderTemplate>
      Política de privacidade
      <template #descricao>A política de privacidade (LGPD) aparece na página “Sobre” e em /privacidade.</template>
    </HeaderTemplate>

    <form class="card p-3 d-flex flex-column gap-3" novalidate @submit.prevent="salvar">
      <Loader v-if="carregando" />
      <template v-else>
        <div class="row g-3">
          <div class="col-md-6">
            <AdminFormField v-slot="campo" rotulo="Responsável pelos dados" ajuda="Quem responde por dúvidas e pedidos sobre dados pessoais.">
              <input :id="campo.id" v-model="form.responsavel" type="text" maxlength="120" class="form-control" :aria-describedby="campo.descritoPor">
            </AdminFormField>
          </div>
          <div class="col-md-6">
            <AdminFormField v-slot="campo" rotulo="E-mail de privacidade" :erro="errors.email">
              <input :id="campo.id" v-model="form.email" type="email" maxlength="120" class="form-control" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
            </AdminFormField>
          </div>
        </div>

        <AdminFormField v-slot="campo" rotulo="Texto da política" ajuda="Separe os parágrafos com uma linha em branco. Em branco, o site mostra o texto-base do sistema (sem revisão jurídica); o ideal é publicar um texto revisado por um profissional de direito digital.">
          <textarea :id="campo.id" v-model="form.texto" rows="26" maxlength="40000" class="form-control campo-texto" :aria-describedby="campo.descritoPor" />
        </AdminFormField>

        <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <p class="small text-body-secondary mb-0">
            <template v-if="atualizadoEm">Última publicação: {{ atualizadoEm }}. </template>
            <a href="/privacidade" target="_blank" rel="noopener">Ver a página pública<span class="visually-hidden"> (abre em nova aba)</span></a>
          </p>
          <PrimaryButton type="submit" :carregando="salvando">
            <i class="bi bi-check-lg" aria-hidden="true" />
            Publicar
          </PrimaryButton>
        </div>
      </template>
    </form>
  </div>
</template>

<script setup lang="ts">
const { $services } = useNuxtApp()
const alerta = useAlerta()

useHead({ title: 'Política de privacidade' })
definePageMeta({ layout: 'admin' })

const form = reactive({ texto: '', responsavel: '', email: '' })
const errors = reactive<Record<string, string>>({})
const carregando = ref(true)
const salvando = ref(false)
const atualizadoEm = ref<string | null>(null)

onMounted(async () => {
  try {
    const { data } = await $services.politica.get()
    Object.assign(form, { texto: data.texto, responsavel: data.responsavel, email: data.email })
    atualizadoEm.value = data.atualizado_em
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível carregar a política.'))
  } finally {
    carregando.value = false
  }
})

watch(() => form.email, () => { delete errors.email })

async function salvar() {
  Object.keys(errors).forEach((chave) => delete errors[chave])
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Informe um e-mail válido.'
  if (!alerta.validar(errors)) return

  try {
    salvando.value = true
    const { data } = await $services.politica.salvar({ texto: form.texto, responsavel: form.responsavel, email: form.email })
    atualizadoEm.value = data.atualizado_em
    alerta.sucesso('Política publicada.')
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível salvar a política.'))
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.campo-texto {
  min-height: 12rem;
  resize: vertical;
}
</style>
