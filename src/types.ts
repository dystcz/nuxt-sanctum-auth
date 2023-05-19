import { FetchOptions, FetchRequest, FetchResponse } from 'ofetch'

export interface Endpoints {
  csrf: string
  login: string
  logout: string
  user: string
}

export interface Redirects {
  home: string
  login: string
  logout: string
}

export interface ModuleOptions {
  csrf: CSRFSpec
  token: boolean
  baseUrl: string
  endpoints: Endpoints
  redirects: Redirects
  redirectByDefault: boolean
  globalMiddleware: boolean
}

export interface Auth {
  user: any | null
  loggedIn: boolean
  token: string | null
}

export interface CSRFSpec {
  headerKey: string
  cookieKey: string
  tokenCookieKey: string
}

export type ApiFetch = <T>(
  endpoint: FetchRequest,
  options?: FetchOptions
) => Promise<T>

export type Csrf = Promise<void>

export type Response<ResponseT, ErrorT> = Promise<{
  response?: FetchResponse<ResponseT>
  error?: FetchResponse<ErrorT>
}>

export interface SanctumAuthPlugin {
  login<ResponseT, ErrorT>(data: any): Response<ResponseT, ErrorT>
  loginRequest<ResponseT, ErrorT>(data: any): Response<ResponseT, ErrorT>
  logout<ResponseT, ErrorT>(): Response<ResponseT, ErrorT>
  getUser<ResponseT, ErrorT>(): Response<ResponseT, ErrorT>
}

// @ts-ignore
declare module 'vue/types/vue' {
  interface Vue {
    $sanctumAuth: SanctumAuthPlugin
  }
}

// Nuxt Bridge & Nuxt 3
declare module '#app' {
  interface NuxtApp extends PluginInjection {}
}

interface PluginInjection {
  $sanctumAuth: SanctumAuthPlugin
  $apiFetch: ApiFetch
  $csrf: Csrf
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties extends PluginInjection {}
}
