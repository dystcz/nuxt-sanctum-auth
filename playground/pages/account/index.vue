<script setup lang="ts">
import { definePageMeta, useAuth, useNuxtApp, useRouter } from '#imports'
definePageMeta({
  middleware: ['auth']
})

const { $sanctumAuth } = useNuxtApp()
const auth = useAuth()
const router = useRouter()

async function logout() {
  const { error, response } = await $sanctumAuth.logout()
  if (error) {
    console.log(error._data)
    return
  }

  console.log(response?._data)
  router.push('/auth/login')
}
</script>

<template>
  <div
    class="flex flex-col p-4 rounded shadow space-y-4 bg-white min-w-[400px] max-w-xl"
  >
    <h1 class="text-xl font-bold">You are logged in</h1>
    <p class="mb-2">Page accessable only for authenticated users</p>
    <ClientOnly>
      <code
        class="block text-xs p-4 rounded bg-gray-100 border border-gray-200 mb-2"
      >
        <pre>{{ auth }}</pre>
      </code>
    </ClientOnly>

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
