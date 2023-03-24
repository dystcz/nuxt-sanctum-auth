import {
  defineNuxtPlugin,
  addRouteMiddleware,
  useState,
  useRuntimeConfig,
  useCookie
  // @ts-ignore
} from '#app'
import { ofetch } from 'ofetch'
import { ModuleOptions, Auth, Callback } from '../types'

export default defineNuxtPlugin(async () => {
  const auth = useState<Auth>('auth', () => {
    return {
      user: null,
      loggedIn: false
    }
  })

  const config: ModuleOptions = useRuntimeConfig().nuxtSanctumAuth

  addRouteMiddleware('auth', async () => {
    await getUser()

    if (auth.value.loggedIn === false) {
      return config.redirects.login
    }
  })

  addRouteMiddleware('guest', async () => {
    await getUser()

    if (auth.value.loggedIn) {
      return config.redirects.home
    }
  })

  const apiFetch = ofetch.create({
    baseURL: config.baseUrl,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': useCookie('XSRF-TOKEN').value
    } as HeadersInit
  })

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
    await csrf()

    try {
      const response = await apiFetch<Response>(config.endpoints.login, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Accept: 'application/json',
          'X-XSRF-TOKEN': useCookie('XSRF-TOKEN').value
        } as HeadersInit
      })

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
