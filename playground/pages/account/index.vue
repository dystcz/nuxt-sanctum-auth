<script setup lang="ts">
import { definePageMeta, useNuxtApp, useState } from '#imports'
definePageMeta({
  middleware: ['auth']
})

interface Auth {
  user: any
  loggedIn: boolean
}

const { $sanctumAuth } = useNuxtApp()
const auth = useState<Auth>('auth').value
const logout = async () => {
  await $sanctumAuth.logout()
}
</script>

<template>
  <div
    class="flex flex-col p-4 rounded shadow space-y-4 bg-white min-w-[400px] text-center max-w-xl"
  >
    <h1 class="text-xl font-bold">You are logged in</h1>
    <code class="block p-4 rounded bg-gray-100 border border-gray-200 mb-2">{{
      auth
    }}</code>

    <nuxt-link class="text-blue-500 underline" to="/">
      Go to index page
    </nuxt-link>

    <button
      type="button"
      @click.prevent="logout"
      class="w-full block rounded bg-blue-500 uppercase text-white py-2"
    >
      log out
    </button>
  </div>
</template>
