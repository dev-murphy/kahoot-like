<script setup lang="ts">
useHead({ title: 'Game Master Login' })

const store = useMasterStore()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await store.login(username.value, password.value)
    router.push('/master')
  } catch (e: unknown) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="app-bg flex min-h-screen flex-col items-center justify-center px-6 py-12 text-white">
    <form class="animate-pop-in w-full max-w-sm card flex flex-col gap-4 p-6" @submit.prevent="submit">
      <div class="text-center">
        <img src="/logo.png" alt="QuizRush" class="mx-auto h-14 w-14" />
        <h1 class="font-display text-2xl font-extrabold text-slate-800 dark:text-slate-100">Game Master</h1>
        <p class="text-sm text-slate-400 dark:text-slate-500">Sign in to manage tonight's games</p>
      </div>

      <label class="flex flex-col gap-1">
        <span class="text-sm font-semibold text-slate-600 dark:text-slate-300">Username</span>
        <input
          v-model="username"
          type="text"
          autocomplete="username"
          class="rounded-xl border border-slate-200 px-4 py-3 text-black dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          autofocus
        />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-semibold text-slate-600 dark:text-slate-300">Password</span>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          class="rounded-xl border border-slate-200 px-4 py-3 text-black dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />
      </label>

      <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600">{{ error }}</p>

      <button
        type="submit"
        class="btn-touch min-h-[52px] rounded-2xl bg-indigo-600 text-lg font-display font-bold text-white shadow-lg disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? 'Signing in…' : 'Sign In' }}
      </button>
    </form>
  </div>
</template>
