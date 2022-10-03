// @ts-ignore
import {
  defineNuxtPlugin,
  addRouteMiddleware,
  useState,
  useRouter,
  useRuntimeConfig,
  navigateTo,
} from '#app'
import { $fetch } from 'ohmyfetch'
import Cookies from 'js-cookie'

export default defineNuxtPlugin((nuxtApp) => {
  const auth = useState('auth', () => {
    return {
      user: null,
      loggedIn: false,
    }
  })
  const config = useRuntimeConfig()
  const router = useRouter()

  addRouteMiddleware('auth', async () => {
    await getUser()

    if (auth.value.loggedIn === false) {
      return navigateTo(config.nuxtSanctumAuth.redirects.login)
    }
  })
  addRouteMiddleware('guest', async () => {
    await getUser()

    if (auth.value.loggedIn) {
      return navigateTo(config.nuxtSanctumAuth.redirects.home)
    }
  })

  const apiFetch = $fetch.create({
    baseURL: config.baseUrl,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN'),
    },
  })

  const csrf = () => {
    apiFetch(config.nuxtSanctumAuth.endpoints.csrf)
  }

  const getUser = async () => {
    if (auth.value.loggedIn && auth.value.user) {
      return auth.value.user
    }
    try {
      const user = await apiFetch(config.nuxtSanctumAuth.endpoints.user)
      auth.value.loggedIn = true
      auth.value.user = user
      return user
    } catch (error) {
      // console.log(error)
    }
  }

  const login = async (data) => {
    await csrf()
    try {
      await apiFetch(config.nuxtSanctumAuth.endpoints.login, {
        method: 'POST',
        body: JSON.stringify(data),
      })

      await getUser()
      router.push(config.nuxtSanctumAuth.redirects.home)
    } catch (error) {
      throw error.data
    }
  }

  const logout = async () => {
    try {
      await apiFetch(config.nuxtSanctumAuth.endpoints.logout, {
        method: 'POST',
      })
    } catch (error) {
      console.log(error)
    } finally {
      auth.value.loggedIn = false
      auth.value.user = null

      window.location.href = config.nuxtSanctumAuth.redirects.logout
      // router.push(config.nuxtSanctumAuth.redirects.logout)
    }
  }

  return {
    provide: {
      apiFetch,
      sanctumAuth: {
        login,
        getUser,
        logout,
      },
    },
  }
})
