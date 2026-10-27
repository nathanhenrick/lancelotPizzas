<template>
  <div class="ajuste">
    <div class="ajuste__corpo">
      <div class="ajuste__sabor">
        <span class="ajuste__nome titulo">{{ nome }}</span>
        <button v-if="podeTrocar" type="button" class="ajuste__trocar" @click="emit('trocar')">Trocar</button>
      </div>

      <div class="ajuste__colunas">
        <section v-if="ingredientes.length" aria-labelledby="ajuste-ingredientes">
          <h3 id="ajuste-ingredientes" class="ajuste__rotulo">Ingredientes — toque para remover</h3>
          <ul class="ajuste__chips">
            <li v-for="item in ingredientes" :key="item">
              <button
                type="button"
                class="chip"
                :class="{ 'chip--removido': ajuste.removidos.includes(item) }"
                :aria-pressed="ajuste.removidos.includes(item)"
                @click="alternar(ajuste.removidos, item)"
              >
                <span class="chip__marca" aria-hidden="true">−</span>
                <span class="chip__nome">{{ item }}</span>
                <span v-if="ajuste.removidos.includes(item)" class="sr-only">(removido)</span>
              </button>
            </li>
          </ul>
        </section>

        <section v-if="adicionais.length" aria-labelledby="ajuste-adicionais">
          <h3 id="ajuste-adicionais" class="ajuste__rotulo">Adicionais</h3>
          <ul class="ajuste__chips ajuste__chips--lista">
            <li v-for="extra in adicionais" :key="extra.id">
              <button
                type="button"
                class="chip chip--extra"
                :class="{ 'chip--marcado': ajuste.adicionais.includes(extra.id) }"
                :aria-pressed="ajuste.adicionais.includes(extra.id)"
                @click="alternar(ajuste.adicionais, extra.id)"
              >
                <span class="chip__marca" aria-hidden="true">{{ ajuste.adicionais.includes(extra.id) ? '✓' : '+' }}</span>
                <span class="chip__nome">{{ extra.nome }}</span>
                <span class="chip__preco">+{{ formatarPreco(extra.preco) }}</span>
              </button>
            </li>
          </ul>
        </section>
      </div>

      <div class="ajuste__obs">
        <label for="ajuste-obs" class="ajuste__rotulo">{{ rotuloObservacao }}</label>
        <textarea
          id="ajuste-obs"
          v-model="ajuste.observacao"
          class="ajuste__campo"
          rows="6"
          maxlength="140"
          placeholder="Ex.: bem assado, pouco sal…"
        />
      </div>
    </div>

    <div class="ajuste__rodape">
      <BaseButton bloco @click="emit('confirmar', { removidos: [...ajuste.removidos], adicionais: [...ajuste.adicionais], observacao: ajuste.observacao.trim() })">
        {{ rotuloConfirmar }}{{ extras > 0 ? ` · +${formatarPreco(extras)}` : '' }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Adicional, AjusteParte } from '~/types/pizza'

const props = withDefaults(defineProps<{
  nome: string
  ingredientes: string[]
  adicionais: Adicional[]
  inicial: AjusteParte
  rotuloConfirmar?: string
  rotuloObservacao?: string
  podeTrocar?: boolean
  unidades?: number
}>(), { rotuloConfirmar: 'Confirmar', rotuloObservacao: 'Observação', podeTrocar: false, unidades: 1 })

const emit = defineEmits<{ trocar: [], confirmar: [ajuste: AjusteParte] }>()

const ajuste = reactive<AjusteParte>({
  removidos: [...props.inicial.removidos],
  adicionais: [...props.inicial.adicionais],
  observacao: props.inicial.observacao
})

const extras = computed(() =>
  props.unidades * ajuste.adicionais.reduce((t, id) => t + (props.adicionais.find((a) => a.id === id)?.preco ?? 0), 0)
)

function alternar<T>(lista: T[], valor: T) {
  const i = lista.indexOf(valor)
  if (i >= 0) lista.splice(i, 1)
  else lista.push(valor)
}
</script>

<style scoped>
.ajuste {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.ajuste__corpo {
  flex: 1;
  min-height: 0;
  container-type: inline-size;
  overflow-y: auto;
  padding: 0.25rem 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ajuste__sabor {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  background: var(--primary);
  color: var(--primary-fg);
}

.ajuste__nome {
  font-size: 1.0625rem;
  text-transform: uppercase;
}

.ajuste__trocar {
  min-height: 2rem;
  padding: 0 0.875rem;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  color: inherit;
  font-weight: 600;
}

.ajuste__colunas {
  display: grid;
  gap: 1rem;
}

.ajuste__rotulo {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--muted);
}

.ajuste__chips {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ajuste__chips--lista {
  flex-direction: column;
  flex-wrap: nowrap;
}

.chip {
  width: 100%;
  min-height: 2.75rem;
  padding: 0 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  text-align: left;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.ajuste__chips:not(.ajuste__chips--lista) .chip {
  width: auto;
}

.chip:hover {
  border-color: var(--fg);
}

.chip__marca {
  flex: none;
  width: 1rem;
  text-align: center;
  color: var(--muted);
}

.chip__nome {
  flex: 1;
}

.chip__preco {
  font-weight: 600;
  white-space: nowrap;
  color: var(--accent-text);
}

.chip--removido {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 10%, var(--surface));
}

.chip--removido .chip__nome {
  text-decoration: line-through;
  color: var(--muted);
}

.chip--marcado {
  border-color: var(--success);
  background: color-mix(in srgb, var(--success) 10%, var(--surface));
}

.chip--marcado .chip__marca {
  color: var(--success);
}

.ajuste__campo {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--fg);
  font: inherit;
  resize: none;
}

.ajuste__rodape {
  flex: none;
  padding: 0.75rem 0.75rem calc(0.75rem + env(safe-area-inset-bottom));
  border-top: 1px solid var(--border);
  background: var(--surface-2);
}

@container (min-width: 600px) {
  .ajuste__colunas {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}
</style>
