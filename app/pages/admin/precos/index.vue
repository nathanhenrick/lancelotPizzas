<template>
  <div>
    <HeaderTemplate>
      Tamanhos e preços
      <template #descricao>O preço da pizza vem da faixa do sabor e do tamanho escolhido. Aqui você muda os valores e a regra para pizzas com mais de um sabor.</template>
    </HeaderTemplate>

    <Loader v-if="isLoading" />
    <form v-else class="d-flex flex-column gap-4" @submit.prevent="apply">
      <section class="card p-3" aria-labelledby="tamanhos-titulo">
        <h2 id="tamanhos-titulo" class="h5 fw-bold mb-3">Tamanhos</h2>
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead>
              <tr>
                <th>Nome <span class="obrigatorio" aria-hidden="true">*</span></th>
                <th>Descrição</th>
                <th style="width: 170px">Máximo de sabores</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in form.tamanhos" :key="t.id">
                <td><input v-model="t.nome" type="text" class="form-control" :class="{ 'is-invalid': tentouSalvar && !t.nome.trim() }" aria-required="true" :aria-invalid="tentouSalvar && !t.nome.trim()" :aria-label="`Nome do tamanho ${t.nome}`"></td>
                <td><input v-model="t.info" type="text" class="form-control" :aria-label="`Descrição do tamanho ${t.nome}`"></td>
                <td>
                  <select v-model.number="t.max_sabores" class="form-select" :aria-label="`Máximo de sabores do tamanho ${t.nome}`">
                    <option v-for="n in 4" :key="n" :value="n">{{ n }}</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card p-3" aria-labelledby="faixas-titulo">
        <h2 id="faixas-titulo" class="h5 fw-bold mb-1">Preços por faixa</h2>
        <p class="text-body-secondary small mb-3">Cada sabor pertence a uma faixa. Ao mudar um valor aqui, todos os sabores da faixa mudam juntos.</p>
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead>
              <tr>
                <th>Faixa <span class="obrigatorio" aria-hidden="true">*</span></th>
                <th v-for="t in form.tamanhos" :key="t.id" style="min-width: 140px">{{ t.nome }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(faixa, chave) in form.faixas" :key="chave">
                <td style="min-width: 160px"><input v-model="faixa.nome" type="text" class="form-control" :class="{ 'is-invalid': tentouSalvar && !faixa.nome.trim() }" aria-required="true" :aria-invalid="tentouSalvar && !faixa.nome.trim()" :aria-label="`Nome da faixa ${faixa.nome}`"></td>
                <td v-for="t in form.tamanhos" :key="t.id">
                  <AdminPriceInput v-model="faixa[t.id]" :rotulo="`Preço da faixa ${faixa.nome} no tamanho ${t.nome}`" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card p-3" aria-labelledby="regra-titulo">
        <h2 id="regra-titulo" class="h5 fw-bold mb-1">Preço da pizza com mais de um sabor</h2>
        <p class="text-body-secondary small mb-3">Como cobrar quando a pizza é dividida em dois ou mais sabores de faixas diferentes.</p>
        <div v-for="regra in REGRAS" :key="regra.valor" class="form-check">
          <input :id="`regra-${regra.valor}`" v-model="regraPreco" type="radio" class="form-check-input" name="regra-preco" :value="regra.valor">
          <label :for="`regra-${regra.valor}`" class="form-check-label">
            {{ regra.rotulo }}
            <span class="d-block small text-body-secondary">{{ regra.exemplo }}</span>
          </label>
        </div>
      </section>

      <div class="d-flex justify-content-end">
        <PrimaryButton type="submit" :carregando="isSaving">
          <i class="bi bi-check-lg" aria-hidden="true" />
          Salvar alterações
        </PrimaryButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { RegraPreco, TabelaPrecos } from '~/types/pizza'

const REGRAS: { valor: RegraPreco, rotulo: string, exemplo: string }[] = [
  { valor: 'maior', rotulo: 'Vale o sabor de maior valor', exemplo: 'Meia de R$ 68 com meia de R$ 78 sai por R$ 78.' },
  { valor: 'media', rotulo: 'Média dos sabores', exemplo: 'Meia de R$ 68 com meia de R$ 78 sai por R$ 73.' }
]

const { $services } = useNuxtApp()
const cardapio = useCardapioStore()
const alerta = useAlerta()

useHead({ title: 'Tamanhos e preços' })
definePageMeta({ layout: 'admin' })

const form = ref<TabelaPrecos>({ tamanhos: [], faixas: { ...cardapio.faixas } })
const regraPreco = ref<RegraPreco>(cardapio.config.regra_preco)
const isLoading = ref(true)
const isSaving = ref(false)

onMounted(async () => {
  try {
    const [tabela, config] = await Promise.all([$services.precos.get(), $services.config.get()])
    form.value = tabela.data
    regraPreco.value = config.data.regra_preco
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível carregar os preços.'))
  } finally {
    isLoading.value = false
  }
})

const tentouSalvar = ref(false)

function validate() {
  tentouSalvar.value = true
  const erros: Record<string, string> = {}
  if (form.value.tamanhos.some((t) => !t.nome.trim())) erros.tamanhos = 'Todo tamanho precisa de um nome.'
  if (Object.values(form.value.faixas).some((f) => !f.nome.trim())) erros.faixas = 'Toda faixa de preço precisa de um nome.'
  return alerta.validar(erros)
}

async function apply() {
  if (!validate()) return
  try {
    isSaving.value = true
    await $services.precos.update(form.value)
    await $services.config.update({ regra_preco: regraPreco.value })
    await cardapio.carregar()
    alerta.sucesso('Tamanhos e preços atualizados.')
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível salvar.'))
  } finally {
    isSaving.value = false
  }
}
</script>
