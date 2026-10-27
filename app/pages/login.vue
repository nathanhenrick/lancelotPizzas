<template>
  <form class="card login p-4" novalidate @submit.prevent="entrar">
    <div class="mb-4 text-center">
      <AppLogo class="login__logo mb-3" :rotulo="`${cardapio.config.nome}, ir para o site`" />
      <h1 class="h4 fw-bold mb-1">Entrar no painel</h1>
      <p class="text-body-secondary small mb-0">Use o e-mail e a senha da sua pizzaria.</p>
    </div>

    <div class="d-flex flex-column gap-3">
      <AdminFormField v-slot="campo" rotulo="E-mail" :erro="errors.email" obrigatorio>
        <input :id="campo.id" v-model="form.email" type="email" class="form-control" autocomplete="username" autofocus :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
      </AdminFormField>

      <AdminFormField v-slot="campo" rotulo="Senha" :erro="errors.senha" obrigatorio>
        <div class="input-group">
          <input :id="campo.id" v-model="form.senha" :type="mostrarSenha ? 'text' : 'password'" class="form-control" autocomplete="current-password" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
          <button type="button" class="btn btn-outline-secondary" :aria-label="mostrarSenha ? 'Esconder senha' : 'Mostrar senha'" :aria-pressed="mostrarSenha" @click="mostrarSenha = !mostrarSenha">
            <i :class="['bi', mostrarSenha ? 'bi-eye-slash' : 'bi-eye']" aria-hidden="true" />
          </button>
        </div>
      </AdminFormField>

      <button type="submit" class="btn btn-primary w-100 fw-semibold" :disabled="carregando">
        <Loader v-if="carregando" linha :tamanho="20" texto="Entrando…" class="me-2" />{{ carregando ? 'Entrando…' : 'Entrar' }}
      </button>
    </div>

    <a href="/" class="small text-center">Voltar para o site</a>
  </form>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const cardapio = useCardapioStore()
const route = useRoute()

useHead({ title: 'Entrar' })
definePageMeta({ layout: 'auth' })

const alerta = useAlerta()

const form = reactive({ email: '', senha: '' })
const errors = reactive<Record<string, string>>({})
const carregando = ref(false)
const mostrarSenha = ref(false)

watch(form, () => {
  Object.keys(errors).forEach((chave) => delete errors[chave])
})

async function entrar() {
  if (!form.email.trim()) errors.email = 'Preencha o e-mail.'
  if (!form.senha) errors.senha = 'Preencha a senha.'
  if (!alerta.validar(errors)) return

  carregando.value = true
  try {
    await auth.login(form.email.trim(), form.senha)
    const voltar = String(route.query.voltar ?? '')
    await navigateTo(voltar.startsWith('/admin/') ? voltar : '/admin/dashboard')
  } catch (err) {
    alerta.erro(mensagemErro(err, 'Não foi possível entrar. Confira a sua conexão e tente de novo.'))
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.login {
  width: 100%;
  max-width: 400px;
}

.login__logo {
  height: 8rem;
}
</style>
