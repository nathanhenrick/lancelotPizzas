<template>
  <div>
    <HeaderTemplate>
      Pizzaria
      <template #descricao>Estes dados aparecem na página "Sobre a pizzaria" do site, para o cliente saber tudo sobre vocês.</template>
    </HeaderTemplate>

    <Loader v-if="isLoading" />
    <form v-else class="d-flex flex-column gap-4 mb-4" novalidate @submit.prevent="apply">
      <section class="card p-3" aria-labelledby="sec-identidade">
        <h2 id="sec-identidade" class="h5 fw-bold mb-3">Identidade</h2>
        <div class="row g-3">
          <div class="col-md-6">
            <AdminFormField v-slot="campo" rotulo="Nome da pizzaria" :erro="errors.nome" obrigatorio>
              <input :id="campo.id" v-model="form.nome" type="text" maxlength="80" class="form-control" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
            </AdminFormField>
          </div>
          <div class="col-md-6">
            <AdminFormField v-slot="campo" rotulo="Razão social" ajuda="Nome registrado da empresa, se for diferente.">
              <input :id="campo.id" v-model="form.razao_social" type="text" maxlength="120" class="form-control" :aria-describedby="campo.descritoPor">
            </AdminFormField>
          </div>
          <div class="col-md-6">
            <AdminFormField v-slot="campo" rotulo="CNPJ" :erro="errors.cnpj">
              <input :id="campo.id" v-model="form.cnpj" v-mask-cnpj type="text" inputmode="numeric" autocomplete="off" class="form-control" placeholder="00.000.000/0000-00" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
            </AdminFormField>
          </div>
          <div class="col-12">
            <AdminFormField v-slot="campo" rotulo="Sobre a pizzaria" ajuda="Uma apresentação curta: história, diferenciais, o que vocês têm de especial.">
              <textarea :id="campo.id" v-model="form.descricao" rows="9" maxlength="1000" class="form-control campo-texto" :aria-describedby="campo.descritoPor" />
            </AdminFormField>
          </div>
        </div>
      </section>

      <section class="card p-3" aria-labelledby="sec-contato">
        <h2 id="sec-contato" class="h5 fw-bold mb-3">Contato</h2>
        <div class="row g-3">
          <div class="col-md-6">
            <AdminFormField v-slot="campo" rotulo="WhatsApp que recebe os pedidos" :erro="errors.whatsapp" ajuda="DDD e número. Em branco, o site mostra só a mensagem do pedido.">
              <div class="input-group">
                <span class="input-group-text">+55</span>
                <input :id="campo.id" v-model="whatsappNacional" v-mask-phone.br type="tel" inputmode="numeric" autocomplete="off" class="form-control" placeholder="(44) 9 9999-9999" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
              </div>
            </AdminFormField>
          </div>
          <div class="col-md-6">
            <AdminFormField v-slot="campo" rotulo="Telefone fixo ou outro telefone" :erro="errors.telefone">
              <input :id="campo.id" v-model="form.telefone" v-mask-phone.br type="tel" inputmode="numeric" autocomplete="off" class="form-control" placeholder="(44) 3333-3333" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
            </AdminFormField>
          </div>
          <div class="col-md-6">
            <AdminFormField v-slot="campo" rotulo="E-mail" :erro="errors.email">
              <input :id="campo.id" v-model="form.email" type="email" maxlength="120" autocomplete="off" class="form-control" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
            </AdminFormField>
          </div>
          <div class="col-md-3">
            <AdminFormField v-slot="campo" rotulo="Instagram" ajuda="Só o usuário.">
              <div class="input-group">
                <span class="input-group-text">@</span>
                <input :id="campo.id" v-model="form.instagram" type="text" maxlength="60" autocomplete="off" class="form-control" :aria-describedby="campo.descritoPor">
              </div>
            </AdminFormField>
          </div>
          <div class="col-md-3">
            <AdminFormField v-slot="campo" rotulo="Facebook" ajuda="Usuário ou link da página.">
              <input :id="campo.id" v-model="form.facebook" type="text" maxlength="100" autocomplete="off" class="form-control" :aria-describedby="campo.descritoPor">
            </AdminFormField>
          </div>
        </div>
      </section>

      <section class="card p-3" aria-labelledby="sec-endereco">
        <h2 id="sec-endereco" class="h5 fw-bold mb-3">Endereço</h2>
        <div class="row g-3">
          <div class="col-md-3">
            <AdminFormField v-slot="campo" rotulo="CEP" :erro="errors.cep">
              <input :id="campo.id" v-model="form.cep" v-mask-cep type="text" inputmode="numeric" autocomplete="off" class="form-control" placeholder="00000-000" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
            </AdminFormField>
          </div>
          <div class="col-md-6">
            <AdminFormField v-slot="campo" rotulo="Rua / avenida">
              <input :id="campo.id" v-model="form.logradouro" type="text" maxlength="120" class="form-control">
            </AdminFormField>
          </div>
          <div class="col-md-3">
            <AdminFormField v-slot="campo" rotulo="Número">
              <input :id="campo.id" v-model="form.numero" type="text" maxlength="15" class="form-control">
            </AdminFormField>
          </div>
          <div class="col-md-4">
            <AdminFormField v-slot="campo" rotulo="Complemento">
              <input :id="campo.id" v-model="form.complemento" type="text" maxlength="60" class="form-control">
            </AdminFormField>
          </div>
          <div class="col-md-4">
            <AdminFormField v-slot="campo" rotulo="Bairro">
              <input :id="campo.id" v-model="form.bairro" type="text" maxlength="80" class="form-control">
            </AdminFormField>
          </div>
          <div class="col-md-3">
            <AdminFormField v-slot="campo" rotulo="Cidade">
              <input :id="campo.id" v-model="form.cidade" type="text" maxlength="80" class="form-control">
            </AdminFormField>
          </div>
          <div class="col-md-1">
            <AdminFormField v-slot="campo" rotulo="UF" :erro="errors.uf">
              <input :id="campo.id" v-model="form.uf" type="text" maxlength="2" class="form-control text-uppercase" :aria-invalid="campo.invalido" :aria-describedby="campo.descritoPor">
            </AdminFormField>
          </div>
        </div>
      </section>

      <section class="card p-3" aria-labelledby="sec-horarios">
        <h2 id="sec-horarios" class="h5 fw-bold mb-3">Horário de funcionamento</h2>
        <div class="d-flex flex-column gap-2">
          <div v-for="h in form.horarios" :key="h.dia" class="row g-2 align-items-center">
            <div class="col-4 col-md-2 fw-semibold">{{ h.dia }}</div>
            <div class="col-8 col-md-2">
              <div class="form-check form-switch">
                <input :id="`aberto-${h.dia}`" type="checkbox" role="switch" class="form-check-input" :checked="!h.fechado" @change="alternarDia(h, ($event.target as HTMLInputElement).checked)">
                <label :for="`aberto-${h.dia}`" class="form-check-label">{{ h.fechado ? 'Fechado' : 'Aberto' }}</label>
              </div>
            </div>
            <template v-if="!h.fechado">
              <div class="col-6 col-md-2">
                <input v-model="h.abre" type="time" class="form-control" :aria-label="`${h.dia}: abre às`">
              </div>
              <div class="col-6 col-md-2">
                <input v-model="h.fecha" type="time" class="form-control" :aria-label="`${h.dia}: fecha às`">
              </div>
            </template>
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-outline-secondary align-self-start mt-3" @click="copiarPrimeiroDia">
          Copiar o horário de segunda para os outros dias abertos
        </button>
      </section>

      <section class="card p-3" aria-labelledby="sec-atendimento">
        <h2 id="sec-atendimento" class="h5 fw-bold mb-3">Entrega, retirada e pagamento</h2>
        <div class="row g-3">
          <div class="col-md-6">
            <AdminFormField v-slot="campo" rotulo="Tempo estimado de entrega" ajuda="Ex.: 40 a 60 minutos">
              <input :id="campo.id" v-model="form.tempo_entrega" type="text" maxlength="60" class="form-control" :aria-describedby="campo.descritoPor">
            </AdminFormField>
          </div>
          <div class="col-md-6">
            <AdminFormField v-slot="campo" rotulo="Tempo estimado de retirada no balcão" ajuda="Ex.: 25 a 35 minutos">
              <input :id="campo.id" v-model="form.tempo_retirada" type="text" maxlength="60" class="form-control" :aria-describedby="campo.descritoPor">
            </AdminFormField>
          </div>
          <div class="col-md-6">
            <AdminFormField v-slot="campo" rotulo="Taxa de entrega" ajuda="Ex.: R$ 6,00 · grátis acima de R$ 80">
              <input :id="campo.id" v-model="form.taxa_entrega" type="text" maxlength="120" class="form-control" :aria-describedby="campo.descritoPor">
            </AdminFormField>
          </div>
          <div class="col-md-6">
            <AdminFormField v-slot="campo" rotulo="Onde entregamos" ajuda="Bairros ou raio de entrega.">
              <textarea :id="campo.id" v-model="form.area_entrega" rows="6" maxlength="500" class="form-control campo-texto" :aria-describedby="campo.descritoPor" />
            </AdminFormField>
          </div>
          <div class="col-12">
            <fieldset>
              <legend class="fw-semibold fs-6 mb-1">Formas de pagamento</legend>
              <div class="d-flex flex-wrap gap-2">
                <label v-for="f in FORMAS_PAGAMENTO" :key="f.valor" class="pagamento" :class="{ 'pagamento--ativo': pagamentos.includes(f.valor) }">
                  <input v-model="pagamentos" type="checkbox" class="visually-hidden" :value="f.valor">
                  <i :class="['bi', f.icone]" aria-hidden="true" />
                  {{ f.valor }}
                </label>
                <label class="pagamento" :class="{ 'pagamento--ativo': outrosAtivo }">
                  <input v-model="outrosAtivo" type="checkbox" class="visually-hidden">
                  <i class="bi bi-three-dots" aria-hidden="true" />
                  Outros
                </label>
              </div>
              <input v-if="outrosAtivo" v-model="outrosTexto" type="text" maxlength="100" class="form-control mt-2" style="max-width: 360px" placeholder="Quais? Ex.: Vale-refeição, transferência" aria-label="Outras formas de pagamento">
              <span class="text-body-secondary small d-block mt-1">Marque todas as que vocês aceitam.</span>
            </fieldset>
          </div>
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
import type { ConfigPizzaria, HorarioDia } from '~/types/pizza'

const { $services } = useNuxtApp()
const cardapio = useCardapioStore()
const alerta = useAlerta()

useHead({ title: 'Pizzaria' })
definePageMeta({ layout: 'admin' })

const FORMAS_PAGAMENTO = [
  { valor: 'Pix', icone: 'bi-qr-code' },
  { valor: 'Cartão de crédito', icone: 'bi-credit-card' },
  { valor: 'Cartão de débito', icone: 'bi-credit-card-2-front' },
  { valor: 'Dinheiro', icone: 'bi-cash-coin' }
]

const form = ref<ConfigPizzaria>({ ...cardapio.config, horarios: horariosCompletos(cardapio.config.horarios) })
const pagamentos = ref<string[]>([])
const outrosAtivo = ref(false)
const outrosTexto = ref('')

function lerPagamentos(texto: string) {
  const itens = texto.split(',').map((i) => i.trim()).filter(Boolean)
  const fixos = FORMAS_PAGAMENTO.map((f) => f.valor)
  pagamentos.value = itens.filter((i) => fixos.includes(i))
  const outros = itens.filter((i) => !fixos.includes(i))
  outrosAtivo.value = outros.length > 0
  outrosTexto.value = outros.join(', ')
}

const textoPagamentos = () =>
  [...pagamentos.value, ...(outrosAtivo.value && outrosTexto.value.trim() ? [outrosTexto.value.trim()] : [])].join(', ')

const errors = reactive<Record<string, string>>({})
const isLoading = ref(true)
const isSaving = ref(false)

const whatsappNacional = ref('')
const digitosNacionais = () => apenasDigitos(whatsappNacional.value)
const paraNacional = (completo: string) => {
  const digitos = apenasDigitos(completo)
  return digitos.startsWith('55') && digitos.length >= 12 ? digitos.slice(2) : digitos
}

async function carregar() {
  try {
    const dados = (await $services.config.get()).data
    form.value = {
      ...dados,
      horarios: horariosCompletos(dados.horarios),
      cnpj: formatarCnpj(dados.cnpj),
      cep: formatarCep(dados.cep),
      telefone: formatarTelefone(dados.telefone)
    }
    whatsappNacional.value = paraNacional(dados.whatsapp)
    lerPagamentos(dados.formas_pagamento)
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível carregar as configurações.'))
  } finally {
    isLoading.value = false
  }
}
onMounted(carregar)

function alternarDia(h: HorarioDia, aberto: boolean) {
  h.fechado = !aberto
  if (aberto && !h.abre) { h.abre = '18:00'; h.fecha = '23:00' }
}

function copiarPrimeiroDia() {
  const [base, ...resto] = form.value.horarios
  if (!base) return
  for (const h of resto) {
    if (h.fechado) continue
    h.abre = base.abre
    h.fecha = base.fecha
  }
}

function validate() {
  Object.keys(errors).forEach((chave) => delete errors[chave])
  const f = form.value
  if (!f.nome.trim()) errors.nome = 'O nome é obrigatório.'
  const numero = digitosNacionais()
  if (numero && numero.length !== 10 && numero.length !== 11) errors.whatsapp = 'Informe o DDD e o número completo.'
  const tel = apenasDigitos(f.telefone)
  if (tel && tel.length !== 10 && tel.length !== 11) errors.telefone = 'Informe o DDD e o telefone completo.'
  if (f.cnpj && apenasDigitos(f.cnpj).length !== 14) errors.cnpj = 'O CNPJ deve ter 14 dígitos.'
  if (f.cep && apenasDigitos(f.cep).length !== 8) errors.cep = 'O CEP deve ter 8 dígitos.'
  if (f.uf && !/^[A-Za-z]{2}$/.test(f.uf)) errors.uf = 'Use a sigla do estado, com 2 letras.'
  if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) errors.email = 'Informe um e-mail válido.'
  const semHora = f.horarios.find((h) => !h.fechado && (!h.abre || !h.fecha))
  if (semHora) errors.horarios = `Informe o horário de abertura e fechamento de ${semHora.dia}.`
  return alerta.validar(errors)
}

async function apply() {
  if (!validate()) return
  const f = form.value
  const numero = digitosNacionais()
  try {
    isSaving.value = true
    await $services.config.update({
      ...f,
      nome: f.nome.trim(),
      whatsapp: numero ? `55${numero}` : '',
      formas_pagamento: textoPagamentos(),
      horarios: f.horarios.map((h) => (h.fechado ? { ...h, abre: null, fecha: null } : h))
    })
    await Promise.all([carregar(), cardapio.carregar()])
    alerta.sucesso('Dados da pizzaria salvos.')
  } catch (err) {
    console.error(err)
    alerta.erro(mensagemErro(err, 'Não foi possível salvar.'))
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.campo-texto {
  resize: none;
}

.pagamento {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: var(--bs-border-radius);
  border: 1.5px solid var(--bs-border-color);
  cursor: pointer;
  user-select: none;
}

.pagamento--ativo {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 18%, transparent);
  font-weight: 600;
}

.pagamento:has(input:focus-visible) {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
</style>
