import type { MaybeRefOrGetter } from 'vue'

interface OpcoesSeo {
  titulo?: string
  descricao: MaybeRefOrGetter<string>
  caminho: string
}

export function usePaginaSeo({ titulo, descricao, caminho }: OpcoesSeo) {
  const base = String(useRuntimeConfig().public.siteUrl || '') || useRequestURL().origin
  const url = new URL(caminho, base).toString()
  const nomeDoSite = useNomeDoSite()
  const tituloCompleto = computed(() => (titulo ? `${nomeDoSite.value} - ${titulo}` : nomeDoSite.value))

  useSeoMeta({
    title: titulo,
    description: descricao,
    ogTitle: tituloCompleto,
    ogDescription: descricao,
    ogType: 'website',
    ogUrl: url,
    ogSiteName: nomeDoSite,
    ogLocale: 'pt_BR',
    twitterCard: 'summary',
    twitterTitle: tituloCompleto,
    twitterDescription: descricao
  })

  useHead({ link: [{ rel: 'canonical', href: url }] })
}
