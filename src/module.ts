import { defineNuxtModule, createResolver, addPlugin } from '@nuxt/kit'
import { ModuleOptions } from './types'

const defaults: ModuleOptions = {
  token: false,
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

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-sanctum-auth',
    configKey: 'nuxtSanctumAuth'
  },
  defaults,
  setup(options, nuxt) {
    nuxt.options.runtimeConfig.public.nuxtSanctumAuth = options
    const { resolve } = createResolver(import.meta.url)
    addPlugin(resolve('./runtime/plugin'))
  }
})
