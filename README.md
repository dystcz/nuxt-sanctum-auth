# Nuxt Sanctum Auth

This is a simple package for integrating Laravel Sanctum auth with Nuxt3.
This package is in developement and for now works **only in SPA mode** (**no SSR yet**).

## Installation

```bash
yarn add nuxt-sanctum-auth
# or
npm -i nuxt-sancum-auth
```

Import the module into the `nuxt.config.[js,ts]` and disable `ssr`.

```js
export default defineNuxtConfig({
  ssr: false,
  //...
  modules: [
    //...
    'nuxt-sanctum-auth'
  ]
})
```

You can also define options as below (defaults in example):

```js
export default defineNuxtConfig({
  ssr: false,
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

## Usage

### Login

Package provides you with `$sanctumAuth` plugin, which contains `login` and `logout` methods.

After login the module automatically redirects you to defined `home` route from config.

```vue
<script setup lang="ts">
const { $sanctumAuth } = useNuxtApp()
const errors = ref([])

const login = async () => {
  try {
    await $sanctumAuth.login({
      email: 'email@example.com',
      password: 'supersecretpassword'
    })
  } catch (e) {
    // your error handling
    errors.value = e.errors
  }
}
</script>
```

### Logout

After logout the module automatically redirects you to defined `logout` route from config.

```vue
<script setup lang="ts">
const { $sanctumAuth } = useNuxtApp()

const logout = async () => {
  await $sanctumAuth.logout()
}
</script>
```

### Accessing user

The module automatically pushes info about user into `useState('auth')`.

```vue
<script setup lang="ts">
const { user, loggedIn } = useState('auth').value
</script>

<template>
  <div>
    Is user logged in?
    <sapn>{{ loggedIn ? 'yes' : 'no' }}</sapn>
  </div>
  <div v-if="loggedIn">
    What is users name?
    <sapn>{{ user?.name }}</sapn>
  </div>
</template>
```

### Middleware

Package automatically provides two middlewares for you to use: `auth` and `guest`.

#### Pages available only when not logged in

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})
</script>
```

#### Pages available only when logged in

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
```

### Data fetching

In guarded pages, you will have to use special fetching method inside `useAsyncData`. This methods is responsible for carrying the XSRF token.

```vue
<script setup lang="ts">
const { $apiFetch } = useNuxtApp()
const { data: posts } = await useAsyncData(() => $apiFetch(`posts`))
</script>
```

## Development

- Run `npm run dev:prepare` to generate type stubs.
- Use `npm run dev` to start playground in development mode.
