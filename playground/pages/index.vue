<script setup lang="ts">
import { ref, onMounted, useSanctumAuth } from '#imports'

const loading = ref(true)
const { auth, logout } = useSanctumAuth()

onMounted(() => {
  loading.value = false
})

async function signOut() {
  const { response, error } = await logout()
  if (error) {
    console.log(error._data)
    return
  }

  console.log(response?._data)
}
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

        <button
          type="button"
          @click.prevent="signOut"
          class="w-full block mt-2 rounded bg-blue-500 uppercase text-white py-2"
        >
          log out
        </button>
      </div>
    </template>
  </div>
</template>
