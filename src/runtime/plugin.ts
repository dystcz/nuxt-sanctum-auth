import {
  defineNuxtPlugin,
  addRouteMiddleware,
  useState,
  useRuntimeConfig,
  useCookie
  // @ts-ignore
} from '#app'
import { FetchOptions, FetchRequest, ofetch } from 'ofetch'
import { ModuleOptions, Auth, Callback } from '../types'

export default defineNuxtPlugin(async () => {
  const auth = useState<Auth>('auth', () => {
    return {
      user: null,
      loggedIn: false,
      token: null
    }
  })

  const config: ModuleOptions = useRuntimeConfig().nuxtSanctumAuth

  addRouteMiddleware('fetch-user', async () => {
    getToken()

    await getUser()

  }, { global: true })

  addRouteMiddleware('auth', async () => {
    if (auth.value.loggedIn === false) {
      return config.redirects.login
    }
  })

  addRouteMiddleware('guest', async () => {
    if (auth.value.loggedIn) {
      return config.redirects.home
    }
  })

  const apiFetch = (endpoint: FetchRequest, options?: FetchOptions) => {
    const fetch = ofetch.create({
      baseURL: config.baseUrl,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-XSRF-TOKEN': !config.token ? useCookie('XSRF-TOKEN').value : null,
        'Authorization': config.token ? 'Bearer ' + auth.value.token : null
      } as HeadersInit
    })

    return fetch(endpoint, options)
  }

  async function csrf(): Promise<void> {
    await ofetch(config.endpoints.csrf, {
      baseURL: config.baseUrl,
      credentials: 'include',
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })
  }

  const getToken = () => {
    auth.value.token = useCookie('nuxt-sanctum-auth-token').value
  }

  const setToken = (token: string) => {
    useCookie('nuxt-sanctum-auth-token').value = token
  }

  const clearToken = () => {
    useCookie('nuxt-sanctum-auth-token').value = null
  }

  async function getUser<T>(): Promise<T | undefined> {
    if (auth.value.loggedIn && auth.value.user) {
      return auth.value.user as T
    }

    try {
      const user = await apiFetch(config.endpoints.user)
      if (user) {
        auth.value.loggedIn = true
        auth.value.user = user
        return user as T
      }
    } catch (error) {
      // console.log(error)
    }
  }

  async function login(
    data: any,
    callback?: Callback | undefined
  ): Promise<void> {

    if (!config.token) {
      await csrf()
    }

    try {
      const response = await apiFetch(config.endpoints.login, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Accept: 'application/json',
          'X-XSRF-TOKEN': !config.token ? useCookie('XSRF-TOKEN').value : null,
          'Authorization': config.token ? 'Bearer ' + auth.value.token : null
        } as HeadersInit
      })

      if (config.token && response) {
        setToken(response.token)
      }

      if (callback !== undefined) {
        callback(response)
        return
      }
      window.location.replace(config.redirects.home)
    } catch (error: any) {
      throw error.data
    }
  }

  const logout = async (callback?: Callback | undefined): Promise<void> => {
    try {
      const response = await apiFetch(config.endpoints.logout, {
        method: 'POST'
      })
      if (callback !== undefined) {
        callback(response)
        return
      }

      window.location.replace(config.redirects.logout)
    } catch (error) {
      console.log(error)
    } finally {
      auth.value.loggedIn = false
      auth.value.user = null
      auth.value.token = null
      clearToken()
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
