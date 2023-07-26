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

  /**
   * Method to get CSRF token which will be automatically
   * set and used in header of all requests
   * @returns ```ts
   * Promise<void>
   * ```
   * @example
   * ```ts
   * await csrf()
   * ```
   * */
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

  /**
   * Method to make requests to API
   * @param endpoint - endpoint to make request to
   * @param options - options for request
   * @returns ```ts
   * Promise<FetchResponse<Any>>
   * ```
   * @example
   * ```ts
   * // using in script setup
   * const { apiFetch } = useAuth()
   * const { data, error } = await useAsyncData(
   *  'posts',
   *  () => apiFetch('posts', { method: 'GET' }),
   *  { initialData: [] }
   * )
   * ```
   * */
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

  /**
   * Method to get CSRF token from cookie
   * @returns ```ts
   * string | null
   * ```
   * @example
   * ```ts
   * const { getToken } = useAuth()
   * const token = getToken()
   * ```
   * */

  function getToken(): string | null {
    auth.value.token = useCookie(config.csrf.tokenCookieKey)?.value || null
    return auth.value.token
  }

  /**
   * Method to set CSRF token to cookie
   * @param token - CSRF token
   * @returns ```ts
   * void
   * ```
   * @example
   * ```ts
   * const { setToken } = useAuth()
   * setToken('token')
   * ```
   * */
  function setToken(token: string): void {
    useCookie(config.csrf.tokenCookieKey).value = token
  }

  /**
   * Method to clear CSRF token from cookie
   * @returns ```ts
   * void
   * ```
   * @example
   * ```ts
   * const { clearToken } = useAuth()
   * clearToken()
   * ```
   * */
  function clearToken(): void {
    useCookie(config.csrf.tokenCookieKey).value = null
  }

  /**
   * Method to clear auth state
   * @returns ```ts
   * void
   * ```
   * @example
   * ```ts
   * const { clearState } = useAuth()
   * clearState()
   * ```
   * */
  function clearState(): void {
    auth.value.user = null
    auth.value.loggedIn = false
    auth.value.token = null
    clearToken()
  }

  /**
   * Method to set user to auth state
   * @param user - user object
   * @returns ```ts
   * void
   * ```
   * @example
   * ```ts
   * const { setUser } = useAuth()
   * setUser({ name: 'John Doe' })
   * ```
   * */
  function setUser(user: any) {
    auth.value.user = user
    auth.value.loggedIn = true
  }

  /**
   * Method to get user from API and set it to auth state
   * @typeParam ResponseT - type of server response
   * @typeParam ErrorT - type of server error
   * @returns ```ts
   * Promise<{
   *   response: ResponseT
   *   error: ErrorT
   * }>
   * ```
   * @example
   * ```ts
   * const { response, error } = await getUser<ResponseT, ErrorT>()
   * if (error) {
   *   // handle errors
   *   console.log(error)
   * }
   * if (response) {
   *   // handle response (set to local variable, etc...)
   *   console.log(response)
   * }
   * ```
   * */
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

  /**
   * Method to make login request
   * @param data - object with user credentials
   * @typeParam ResponseT - type of server response
   * @typeParam ErrorT - type of server error
   * @returns ```ts
   * Promise<{
   *   response: ResponseT
   *   error: ErrorT
   * }>
   * ```
   * @example
   * ```ts
   * const { response, error } = await loginRequest<ResponseT, ErrorT>({
   *   email: 'email@example.com',
   *   password: 'password'
   * })
   * if (error) {
   *   // handle errors
   *   console.log(error)
   * }
   * if (response) {
   *   // handle response (manual redirect, etc...)
   *   console.log(response)
   * }
   * ```
   * */
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

  /**
   * Method to login user
   * @param data - object with user credentials
   * @typeParam ResponseT - type of server response
   * @typeParam ErrorT - type of server error
   * @returns ```ts
   * // if redirectByDefault is true (default)
   * // redirects to specified home page after successful login
   * // otherwise returns response and error
   * Promise<{
   *   response: ResponseT
   *   error: ErrorT
   * }>
   * ```
   * @example
   * ```ts
   * const { response, error } = await login<ResponseT, ErrorT>({
   *   email: 'email@example.com',
   *   password: 'password'
   * })
   * if (error) {
   *   // handle errors
   *   console.log(error)
   * }
   * if (response) {
   *   // handle response (manual redirect, etc...)
   *   console.log(response)
   * }
   * ```
   * */
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

  /**
   * Method to logout user
   * @typeParam ResponseT - type of server response
   * @typeParam ErrorT - type of server error
   * @returns ```ts
   * // if redirectByDefault is true (default)
   * // redirects to specified login page after successful logout
   * // otherwise returns response and error
   * {
   *   response: ResponseT
   *   error: ErrorT
   * }
   * ```
   * @example
   * ```ts
   * const { response, error } = await logout<ResponseT, ErrorT>()
   * if (error) {
   *   // handle errors
   *   console.log(error)
   * }
   * if (response) {
   *   // handle response (manual redirect, etc...)
   *   console.log(response)
   * }
   * ```
   * */
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

  return {
    apiFetch,
    auth,
    clearState,
    clearToken,
    csrf,
    getToken,
    getUser,
    login,
    logout,
    setToken,
    setUser
  }
}
