import { useState, useCookie, useRuntimeConfig } from '#app'
import { ofetch } from 'ofetch'
import type { Auth, Csrf, Response } from '../types'
import type { FetchOptions, FetchRequest, FetchResponse } from 'ofetch'

export function useAuth() {
  const config = useRuntimeConfig().public.nuxtSanctumAuth
  const auth = useState<Auth>('auth', () => {
    return {
      user: null,
      loggedIn: false,
      token: null
    }
  })

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

  function apiFetch(endpoint: FetchRequest, options?: FetchOptions) {
    const fetch = ofetch.create({
      baseURL: config.baseUrl,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        [config.csrf.headerKey]: !config.token
          ? useCookie(config.csrf.cookieKey).value
          : null,
        Authorization: config.token ? 'Bearer ' + auth.value.token : null,
        ...options?.headers
      } as HeadersInit
    })

    return fetch.raw(endpoint, options)
  }

  function getToken(): string | null {
    auth.value.token = useCookie(config.csrf.tokenCookieKey)?.value || null
    return auth.value.token
  }

  function setToken(token: string): void {
    useCookie(config.csrf.tokenCookieKey).value = token
  }

  function clearToken(): void {
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

  async function login<ResponseT = unknown, ErrorT = unknown>(
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
  async function checkAuth(): Promise<boolean> {
    if (auth.value.loggedIn === true) return true

    if (config.token) {
      getToken()
    }
    await getUser()
    return auth.value.loggedIn
  }
  return {
    auth,
    apiFetch,
    csrf,
    login,
    getUser,
    logout,
    getToken,
    setToken,
    clearToken,
    clearState,
    setUser,
    checkAuth
  }
}
