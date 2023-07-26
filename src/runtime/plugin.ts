import {
  defineNuxtPlugin,
  addRouteMiddleware,
  useRuntimeConfig
  // @ts-ignore
} from '#app'
import { useAuth } from './useAuth'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig().public.nuxtSanctumAuth
  const { getToken, getUser, auth } = useAuth()

  async function checkAuth(): Promise<boolean> {
    if (auth.value.loggedIn === true) return true

    if (config.token) {
      getToken()
    }
    await getUser()
    return auth.value.loggedIn
  }

  addRouteMiddleware(
    'sanctum',
    async () => {
      if (!process.client) return
      await checkAuth()
    },
    {
      global: true
    }
  )

  addRouteMiddleware(
    'auth',
    async (to, from) => {
      if (!process.client) return
      if (to.meta?.auth === false) return
      if (auth.value.loggedIn === false) {
        return config.redirects.login
      }
    },
    {
      global: config.globalMiddleware
    }
  )

  addRouteMiddleware('guest', async (to, from) => {
    if (!process.client) return
    if (auth.value.loggedIn === true) {
      return config.redirects.home
    }
  })
})
