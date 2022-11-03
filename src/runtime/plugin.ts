// @ts-ignore
import {
  defineNuxtPlugin,
  addRouteMiddleware,
  useState,
  useRouter,
  useRuntimeConfig,
  navigateTo,
  useCookie
  // @ts-ignore
} from '#app'
import { $fetch } from 'ohmyfetch'
import { ModuleOptions } from '../types'

export default defineNuxtPlugin((nuxtApp) => {
  const auth = useState('auth', () => {
    return {
      user: null,
      loggedIn: false
    }
  })
  const config: ModuleOptions = useRuntimeConfig().nuxtSanctumAuth
  const router = useRouter()

  addRouteMiddleware('auth', async () => {
    await getUser()

    if (auth.value.loggedIn === false) {
      return navigateTo(config.redirects.login)
    }
  })
  addRouteMiddleware('guest', async () => {
    await getUser()

    if (auth.value.loggedIn) {
      return navigateTo(config.redirects.home)
    }
  })

  const apiFetch = $fetch.create({
    baseURL: config.baseUrl,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': useCookie('XSRF-TOKEN').value
    }
  })

  const csrf = async () =>
    await $fetch(config.endpoints.csrf, {
      baseURL: config.baseUrl,
      credentials: 'include',
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })

  const getUser = async () => {
    if (auth.value.loggedIn && auth.value.user) {
      return auth.value.user
    }
    try {
      const user = await apiFetch(config.endpoints.user)
      if (user) {
        auth.value.loggedIn = true
        auth.value.user = user
        return user
      }
    } catch (error) {
      // console.log(error)
    }
  }

  const login = async (data) => {
    await csrf()
    try {
      await apiFetch(config.endpoints.login, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      await getUser()
      router.push(config.redirects.home)
    } catch (error) {
      throw error.data
    }
  }

  const logout = async () => {
    try {
      await apiFetch(config.endpoints.logout, {
        method: 'POST'
      })
    } catch (error) {
      console.log(error)
    } finally {
      auth.value.loggedIn = false
      auth.value.user = null

      window.location.replace(config.redirects.logout)
    }
  }

  return {
    provide: {
      apiFetch,
      csrf,
      sanctumAuth: {
        login,
        getUser,
        logout
      }
    }
  }
})
