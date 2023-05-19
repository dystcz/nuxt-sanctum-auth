import {
  defineNuxtPlugin,
  addRouteMiddleware,
  useState,
  useRuntimeConfig,
  useCookie
  // @ts-ignore
} from '#app'
import { FetchOptions, FetchRequest, ofetch, FetchResponse } from 'ofetch'
import { ModuleOptions, Auth, Csrf, Response } from '../types'

export default defineNuxtPlugin(async () => {
  const auth = useState<Auth>('auth', () => {
    return {
      user: null,
      loggedIn: false,
      token: null
    }
  })

  const config: ModuleOptions = useRuntimeConfig().public.nuxtSanctumAuth

  function apiFetch(endpoint: FetchRequest, options?: FetchOptions) {
    const fetch = ofetch.create({
      baseURL: config.baseUrl,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        [config.csrf.headerKey]: !config.token
          ? useCookie(config.csrf.cookieKey).value
          : null,
        Authorization: config.token ? 'Bearer ' + auth.value.token : null
      } as HeadersInit
    })

    return fetch.raw(endpoint, options)
  }

  async function csrf(): Csrf {
    await ofetch(config.endpoints.csrf, {
      baseURL: config.baseUrl,
      credentials: 'include',
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })
  }

  function getToken() {
    auth.value.token = useCookie(config.csrf.tokenCookieKey)?.value || null
  }

  function setToken(token: string) {
    useCookie(config.csrf.tokenCookieKey).value = token
  }

  function clearToken() {
    useCookie(config.csrf.tokenCookieKey).value = null
  }

  function clearState(): void {
    auth.value.user = null
    auth.value.loggedIn = false
    auth.value.token = null
    clearToken()
  }

  function setUser(user: any) {
    auth.value.user = user
    auth.value.loggedIn = true
  }

  async function getUser<ResponseT, ErrorT>(): Response<ResponseT, ErrorT> {
    try {
      const response = await apiFetch(config.endpoints.user)
      setUser(response._data)

      return { response }
    } catch (e: any) {
      return {
        error: (e?.response as FetchResponse<ErrorT>) || undefined
      }
    }
  }

  async function loginRequest<ResponseT, ErrorT>(
    data: any
  ): Response<ResponseT, ErrorT> {
    try {
      if (!config.token) {
        await csrf()
      }

      const response = await apiFetch(config.endpoints.login, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Accept: 'application/json',
          [config.csrf.headerKey]: !config.token
            ? useCookie(config.csrf.cookieKey).value
            : null,
          Authorization: config.token ? 'Bearer ' + auth.value.token : null
        } as HeadersInit
      })

      if (config.token && response?._data?.token) {
        setToken(response?._data?.token)
      }
      return { response }
    } catch (e: any) {
      return {
        error: e?.response as FetchResponse<ErrorT>
      }
    }
  }

  async function login<ResponseT, ErrorT>(
    data: any
  ): Response<ResponseT, ErrorT> {
    const { error } = await loginRequest(data)

    if (error) {
      return { error: error as FetchResponse<ErrorT> }
    }

    if (config.redirectByDefault) {
      window.location.href = config.redirects.home
    }

    return await getUser<ResponseT, ErrorT>()
  }

  async function logout<ResponseT, ErrorT>(): Response<ResponseT, ErrorT> {
    try {
      const response = await apiFetch(config.endpoints.logout, {
        method: 'POST'
      })

      clearState()
      if (config.redirectByDefault) {
        window.location.href = config.redirects.logout
      }
      return { response }
    } catch (e: any) {
      return {
        error: e?.response as FetchResponse<ErrorT>
      }
    }
  }

  async function checkAuth(): Promise<void> {
    if (auth.value.loggedIn === true) return

    if (config.token) {
      getToken()
    }
    await getUser()
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

  return {
    provide: {
      apiFetch,
      csrf,
      sanctumAuth: {
        loginRequest,
        login,
        getUser,
        logout
      }
    }
  }
})
