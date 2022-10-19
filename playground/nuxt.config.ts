import { defineNuxtConfig } from 'nuxt/config'
import nuxtSanctumAuth from '../dist/module'

export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: 'https://cdn.tailwindcss.com?plugins=forms'
        }
      ]
    }
  },

  routeRules: {
    '/account/**': { ssr: false },
    '/auth/**': { ssr: false }
  },

  modules: [nuxtSanctumAuth],

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
