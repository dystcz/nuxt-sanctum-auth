import { defineNuxtConfig } from 'nuxt/config'
import nuxtSanctumAuth from '../dist/module'

export default defineNuxtConfig({
  ssr: false,

  app: {
    head: {
      script: [
        {
          src: 'https://cdn.tailwindcss.com?plugins=forms'
        }
      ]
    }
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
      home: '/',
      login: '/login',
      logout: '/login'
    }
  }
})
