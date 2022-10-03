import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

interface Endpoints {
  csrf?: string
  login?: string
  logout?: string
  user?: string
}

interface Redirects {
  home?: string
  login?: string
  logout?: string
}

export interface ModuleOptions {
  baseUrl?: string
  endpoints?: Endpoints
  redirects?: Redirects
}

const defaults: ModuleOptions = {
  baseUrl: 'http://localhost:8000',
  endpoints: {
    csrf: '/sanctum/csrf-cookie',
    login: '/login',
    logout: '/logout',
    user: '/user',
  },
  redirects: {
    home: '/',
    login: '/login',
    logout: '/login',
  },
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-sanctum-auth',
    configKey: 'nuxtSanctumAuth',
  },
  defaults,
  async setup(options, nuxt) {
    // push options to runtime config
    // @ts-ignore
    nuxt.options.runtimeConfig.public.nuxtSanctumAuth = options

    const { resolve } = createResolver(import.meta.url)
    addPlugin(resolve('./runtime/plugin'))
  },
})
