<script setup lang="ts">
import { ref } from 'vue'
import { definePageMeta, useNuxtApp } from '#imports'

definePageMeta({
  middleware: ['guest']
})

const form = ref({
  email: '',
  password: ''
})
const error = ref('')

const { $sanctumAuth } = useNuxtApp()

const login = async () => {
  try {
    await $sanctumAuth.login(form.value)
  } catch (e: any) {
    console.log(e?.message)
    error.value = e?.message
  }
}
</script>

<template>
  <form
    @submit.prevent="login"
    class="flex flex-col p-4 rounded shadow space-y-4 bg-white min-w-[400px]"
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
      login
    </button>
    <div v-if="error" class="text-sm text-red-500">
      {{ error }}
    </div>
  </form>
</template>
