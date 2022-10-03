# Nuxt Sanctum Auth

This is a simple package for interating Laravel Sanctum auth with Nuxt3.
This package is in developement and for now works only in SPA mode (no ssr yet).

## Installation

```bash
yarn add nuxt-sanctum-auth
# or
npm -i nuxt-sancum-auth
```

Import the module into the `nuxt.config.[js,ts]`

```js
export default defineNuxtConfig({
  //...
  modules: [
    //...
    'nuxt-sanctum-auth'
  ]
})
```

And define options (defaults in example).

```js
export default defineNuxtConfig({
  //...
  modules: [
    //...
    'nuxt-sanctum-auth'
  ],
  nuxtSanctumAuth: {
    baseUrl: 'http://localhost:8000',
    endpoits: {
      csrf: '/sanctum/csrf-cookie',
      login: '/login',
      logout: '/logout',
      user: '/user'
    },
    redirects: {
      home: '/',
      login: '/login',
      logout: '/login'
    }
  }
})
```

## Development

- Run `npm run dev:prepare` to generate type stubs.
- Use `npm run dev` to start [playground](./playground) in development mode.
