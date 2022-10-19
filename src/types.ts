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
  baseUrl: string
  endpoints: Endpoints
  redirects: Redirects
}
