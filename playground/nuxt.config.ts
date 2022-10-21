import { defineNuxtConfig } from 'nuxt/config'
import nuxtSanctumAuth from '../dist/module'

export default defineNuxtConfig({
  app: {
    head: {
      title: 'nuxt-sanctum-auth'
    }
  },

  routeRules: {
    '/account/**': { ssr: false },
    '/auth/**': { ssr: false }
  },

  modules: [nuxtSanctumAuth, '@nuxtjs/tailwindcss'],

  nuxtSanctumAuth: {
    baseUrl: 'http://localhost:8000',
    endpoints: {
      csrf: '/sanctum/csrf-cookie',
      login: '/login',
      logout: '/logout',
      user: '/user'
    },
    redirects: {
      home: '/account',
      login: '/auth/login',
      logout: '/'
    }
  }
})
