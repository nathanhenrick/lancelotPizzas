export type PreferenciaTema = 'system' | 'light' | 'dark'

export const NOMES_TEMA: Record<PreferenciaTema, string> = {
  system: 'Automático',
  light: 'Claro',
  dark: 'Escuro'
}

export const useTema = () => {
  const colorMode = useColorMode()

  const montado = ref(false)
  onMounted(() => { montado.value = true })

  const atual = computed<PreferenciaTema>(() =>
    montado.value && colorMode.preference in NOMES_TEMA ? colorMode.preference as PreferenciaTema : 'system'
  )
  const escuro = computed(() => colorMode.value === 'dark')

  const definir = (preferencia: PreferenciaTema) => { colorMode.preference = preferencia }

  return { atual, escuro, definir }
}
