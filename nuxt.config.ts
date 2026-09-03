// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  nitro: {
    experimental: {
      websocket: true
    }
  },
  runtimeConfig: {
    gameMasterUsername: process.env.GAME_MASTER_USERNAME || 'admin',
    gameMasterPassword: process.env.GAME_MASTER_PASSWORD || '',
    public: {}
  },
  app: {
    head: {
      title: 'QuizRush',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
      ]
    }
  },
  typescript: {
    strict: true
  }
})
