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
const { user } = useState<Auth>('auth').value
const logout = async () => {
  await $sanctumAuth.logout()
}
</script>

<template>
  <div
    class="flex flex-col p-4 rounded shadow space-y-4 bg-white min-w-[400px] text-center"
  >
    <h1 class="text-xl font-bold">You are logged in</h1>

    <div>user: {{ user?.name }}</div>
    <button
      type="button"
      @click.prevent="logout"
      class="w-full block rounded bg-blue-500 uppercase text-white py-2"
    >
      log out
    </button>
  </div>
</template>
