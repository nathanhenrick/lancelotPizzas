const CACHE_UM_DIA = { headers: { 'Cache-Control': 'public, max-age=86400' } }
const CACHE_UMA_SEMANA = { headers: { 'Cache-Control': 'public, max-age=604800' } }
const FORA_DOS_BUSCADORES = { 'X-Robots-Tag': 'noindex, nofollow' }
const ARQUIVOS_DE_PUBLIC = [
  'logo.svg', 'logo-escura.svg', 'logo-horizontal.svg', 'logo-horizontal-escura.svg',
  'logo-simbolo.svg', 'logo-simbolo-escura.svg', 'logo-texto.svg', 'logo-texto-escura.svg',
  'favicon.svg', 'favicon.ico', 'apple-touch-icon.png'
]

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/a11y',
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
    '@pinia/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    server: {
      allowedHosts: ['.ngrok-free.app']
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  },

  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    storageKey: 'montapizza-tema'
  },

  fonts: {
    families: [
      { name: 'Montserrat', provider: 'google', weights: [400, 500, 600, 700, 800] },
      { name: 'Limelight', provider: 'google', weights: [400] }
    ]
  },

  nitro: { compressPublicAssets: { gzip: true, brotli: true } },

  routeRules: {
    '/pizzarias': { redirect: '/' },
    '/admin': { redirect: '/admin/dashboard' },
    '/admin/login': { redirect: '/login' },
    '/admin/**': { ssr: false, headers: FORA_DOS_BUSCADORES },
    '/login': { ssr: false, headers: FORA_DOS_BUSCADORES },
    '/img/**': CACHE_UM_DIA,
    '/img/lp/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    ...Object.fromEntries(ARQUIVOS_DE_PUBLIC.map((arquivo) => [`/${arquivo}`, CACHE_UMA_SEMANA]))
  },

  runtimeConfig: {
    apiBaseUrlServidor: '',
    public: {
      apiBaseUrl: 'http://localhost:8000/api/v1',
      siteUrl: '',
      whatsapp: '5544991486389'
    }
  }
})
