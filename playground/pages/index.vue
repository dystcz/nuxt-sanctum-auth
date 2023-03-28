<script setup lang="ts">
import { ref, onMounted, useNuxtApp, useAuth } from '#imports'

const { $sanctumAuth } = useNuxtApp()
const loading = ref(true)
const auth = useAuth()

onMounted(async () => {
  await $sanctumAuth.getUser()
  loading.value = false
})
</script>

<template>
  <div
    class="flex flex-col p-4 rounded shadow space-y-4 bg-white min-w-[400px] max-w-xl"
  >
    <h1 class="text-xl font-bold">normal page</h1>
    <p>Page accessable for all users</p>

    <div v-if="loading">
      <p class="mb-2">Loading...</p>
    </div>
    <template v-else>
      <div v-if="!auth.loggedIn">
        <h2 class="font-bold">Login</h2>
        <p class="mb-2">Section accessable only for guest users</p>
        <nuxt-link class="text-blue-500 underline" to="/auth/login">
          login
        </nuxt-link>
      </div>

      <div v-else>
        <h2 class="font-bold">Account info</h2>
        <p class="mb-2">Section accessable only for authenticated users</p>
        <code
          class="block text-xs p-4 rounded bg-gray-100 border border-gray-200 mb-2"
        >
          <pre>{{ auth }}</pre>
        </code>
        <nuxt-link class="text-blue-500 underline" to="/account">
          Go to account
        </nuxt-link>
      </div>
    </template>
  </div>
</template>
