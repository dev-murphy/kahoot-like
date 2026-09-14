// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/icon'],
  css: ['~/assets/css/main.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  nitro: {
    experimental: {
      websocket: true
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'description', content: 'A real-time, team-based Kahoot-style quiz game. Join with a PIN and play from your phone.' },
        { name: 'theme-color', content: '#4f46e5' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'QuizRush' },
        { property: 'og:title', content: 'QuizRush' },
        { property: 'og:description', content: 'A real-time, team-based Kahoot-style quiz game. Join with a PIN and play from your phone.' },
        { property: 'og:image', content: '/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'QuizRush' },
        { name: 'twitter:description', content: 'A real-time, team-based Kahoot-style quiz game. Join with a PIN and play from your phone.' },
        { name: 'twitter:image', content: '/og-image.png' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ]
    }
  },
  typescript: {
    strict: true
  }
})
