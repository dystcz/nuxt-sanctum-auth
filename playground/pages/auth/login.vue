<script setup lang="ts">
import { reactive, ref } from 'vue'
import { definePageMeta, useNuxtApp, useRouter } from '#imports'

definePageMeta({
  middleware: ['guest']
})

const { $sanctumAuth } = useNuxtApp()
const router = useRouter()

const form = reactive({
  email: 'pavel@dy.st',
  password: 'hesloheslo'
})

const errors = ref<any>(null)
async function login() {
  const { response, error } = await $sanctumAuth.login(form)

  if (error) {
    console.log(error._data)
    errors.value = error._data
    return
  }

  console.log(response?._data)
  router.push('/account')
}
</script>

<template>
  <form
    @submit.prevent="login"
    class="flex flex-col p-4 rounded shadow space-y-4 w-full bg-white max-w-[400px]"
  >
    <h1 class="text-2xl font-bold text-center">Login</h1>
    <div class="flex flex-col">
      <label for="email">e-mail</label>
      <input
        type="email"
        id="email"
        v-model="form.email"
        class="rounded border-gray-200"
      />
    </div>
    <div class="flex flex-col">
      <label for="password">password</label>
      <input
        type="password"
        id="password"
        v-model="form.password"
        class="rounded border-gray-200"
      />
    </div>
    <button class="w-full block rounded bg-blue-500 uppercase text-white py-2">
      log in
    </button>

    <div v-if="errors" class="text-sm text-red-500">
      {{ errors }}
    </div>
  </form>
</template>
