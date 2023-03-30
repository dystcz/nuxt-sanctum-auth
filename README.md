# Nuxt Sanctum Auth

[![npm version](https://badge.fury.io/js/nuxt-sanctum-auth.svg)](https://badge.fury.io/js/nuxt-sanctum-auth)

This is a simple package for integrating Laravel Sanctum auth with Nuxt3.
This package is in developement and for now works only in **SPA** or **Hybrid** mode. No full SSR support, yet.

## Installation

```bash
yarn add nuxt-sanctum-auth
# or
npm i nuxt-sanctum-auth
```

Import the module into the `nuxt.config.[js,ts]` and disable `ssr`.
Or alternatively disable `ssr` via `routeRules`, only for pages where `auth` or `guest` middlewares are needed. Typically account section and login page.

```js
export default defineNuxtConfig({
  ssr: false,
  // or
  routeRules: {
    '/account/**': { ssr: false },
    '/auth/**': { ssr: false }
  },

  modules: [
    'nuxt-sanctum-auth'
    // ...
  ]
})
```

You can also define options as below (defaults in example):

```js
export default defineNuxtConfig({
  // ...
  modules: [
    'nuxt-sanctum-auth'
    // ...
  ],
  nuxtSanctumAuth: {
    token: false, // set true to use jwt-token auth instead of cookie. default is false
    baseUrl: 'http://localhost:8000',
    endpoints: {
      csrf: '/sanctum/csrf-cookie',
      login: '/login',
      logout: '/logout',
      user: '/user'
    },
    redirects: {
      home: '/account',
      login: '/auth/login',
      logout: '/'
    }
  }
})
```

## Usage

### Login

Package provides you with `$sanctumAuth` plugin, which contains `login` and `logout` methods.

When you log in using the module, it automatically redirects you to the `home` route as defined in the configuration. However, you can also pass a callback function as the second parameter, which will receive the response data as an argument. This can be useful, for example, if you want to fetch additional user data before redirecting them to the application. Just keep in mind that you'll need to handle the redirection manually.

```vue
<script setup>
const { $sanctumAuth } = useNuxtApp()
const router = useRouter()
const errors = ref([])

async function login() {
  try {
    await $sanctumAuth.login(
      {
        email: 'email@example.com',
        password: 'supersecretpassword'
      },
      // optional callback function
      (data) => {
        console.log(data)
        router.push('/account')
      }
    )
  } catch (e) {
    // your error handling
    errors.value = e.errors
  }
}
</script>
```

### Logout

When you log out, the module will automatically redirect you to the `logout` route as defined in the configuration. However, you can also choose to pass a callback function to handle the redirect yourself. The callback function will receive the response data from the logout request as an argument. Please note that all session data will be deleted by the time the callback is executed.

```vue
<script setup>
const { $sanctumAuth } = useNuxtApp()
const router = useRouter()

const logout = async () => {
  await $sanctumAuth.logout(
    // optional callback function
    (data) => {
      console.log(data)
      router.push('/')
    }
  )
}
</script>
```

### Accessing user

The module creates a `useAuth()` composable that utilizes `useState('auth')` in the background. You can use it to get access to a user.

```vue
<script setup>
const { user, loggedIn } = useAuth() // or useState('auth').value
</script>

<template>
  <div>
    Is user logged in?
    <span>{{ loggedIn ? 'yes' : 'no' }}</span>
  </div>
  <div v-if="loggedIn">
    What is users name?
    <span>{{ user.name }}</span>
  </div>
</template>
```

### Middleware

Package automatically provides two middlewares for you to use: `auth` and `guest`.
If you are using `routeRules` make sure to set `ssr: false` for all pages that will be using those middlewares.

#### Pages available only when not logged in

```vue
<script setup>
definePageMeta({
  middleware: 'guest'
})
</script>
```

#### Pages available only when logged in

```vue
<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
```

### Using JWT-token auth instead of cookie

If you want to use Laravel Sanctum with JWT token authentication method,
set the `token` property to true in the module configuration.

```js
nuxtSanctumAuth: {
  token: true
  // other properties
}
```

Your Laravel backend should respond on the login endpoint with a json containing property `token`:

```json
{
  "token": "1|p1tEPICErFs9TpGKjfkz5QcWDi5M4YqJpVLGUwqM"
}
```

Once logged in, the token will be saved in a cookie.

If you need to access the token, use property of `useAuth()`

```vue
<script setup>
const { token } = useAuth()
</script>

<template>
  <div>
    What is auth jwt token?
    <span>{{ token }}</span>
  </div>
</template>
```

### Data fetching

In guarded pages, you will have to use special fetching method inside `useAsyncData`. This methods is responsible for carrying the XSRF or JWT auth token.

```vue
<script setup>
const { $apiFetch } = useNuxtApp()
const { data: posts } = await useAsyncData('posts', () => $apiFetch(`posts`))
</script>
```

### Getting user info in pages/components without middleware

You absolutely can use user information on all pages, even on those that are not guarded by `auth` midleware.
Only downside is that you have to handle potential empty states your self. Typically on ssr pages, because user info is accessable only on client.

```vue
<script setup>
const { $sanctumAuth } = useNuxtApp()
const loading = ref(true)
const auth = useAuth() // return auth state

onMounted(async () => {
  await $sanctumAuth.getUser() // fetch and set user data
  loading.value = false
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <NuxtLink to="/auth/login" v-if="!auth.loggedIn"> Login </NuxtLink>
    <NuxtLink to="/account" v-else> My Account </NuxtLink>
  </div>
</template>
```

## Development

- Run `npm run dev:prepare` to generate type stubs.
- Use `npm run dev` to start playground in development mode.
