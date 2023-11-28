import { defineNuxtConfig } from 'nuxt/config'
import nuxtSanctumAuth from '../dist/module'

export default defineNuxtConfig({
  app: {
    head: {
      title: 'nuxt-sanctum-auth'
    }
  },

  //@ts-ignore
  modules: [nuxtSanctumAuth, '@nuxtjs/tailwindcss'],

  nuxtSanctumAuth: {
    token: false, // set true to test jwt-token auth instead of cookie
    baseUrl: 'http://localhost:8000',
    globalMiddleware: true,
    redirectByDefault: false,
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
