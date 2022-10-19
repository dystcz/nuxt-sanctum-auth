<script setup lang="ts">
import { useState, ref, onMounted, useNuxtApp } from '#imports'

interface Auth {
  user: any
  loggedIn: boolean
}

const { $sanctumAuth } = useNuxtApp()
const auth = ref<Auth>(useState<Auth>('auth').value)

onMounted(async () => {
  await $sanctumAuth.getUser()
  auth.value = useState<Auth>('auth').value
})
</script>

<template>
  <div
    class="flex flex-col p-4 rounded shadow space-y-4 bg-white min-w-[400px] max-w-xl"
  >
    <h1 class="text-xl font-bold">normal page</h1>
    <p>Page accessable for all users</p>

    <div v-if="!auth.loggedIn">
      <h2 class="font-bold">Login</h2>
      <p class="mb-2">Section accessable only for guest users</p>
      <nuxt-link class="text-blue-500 underline" to="/auth/login"
        >login</nuxt-link
      >
    </div>

    <div v-else>
      <h2 class="font-bold">Account info</h2>
      <p class="mb-2">Section accessable only for authenticated users</p>
      <code class="block p-4 rounded bg-gray-100 border border-gray-200 mb-2">{{
        auth
      }}</code>
      <nuxt-link class="text-blue-500 underline" to="/account">
        Go to account
      </nuxt-link>
    </div>
  </div>
</template>
