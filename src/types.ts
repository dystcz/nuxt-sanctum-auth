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
  token: boolean
  baseUrl: string
  endpoints: Endpoints
  redirects: Redirects
}

export interface Auth {
  user: any | null
  loggedIn: boolean
  token: string | null
}

export type Callback = (response: any) => void
