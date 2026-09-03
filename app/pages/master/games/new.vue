<script setup lang="ts">
definePageMeta({ middleware: 'master-auth' })

const title = ref('')
const creating = ref(false)
const error = ref('')
const router = useRouter()

async function create() {
  if (!title.value.trim()) {
    error.value = 'Please enter a game title'
    return
  }
  creating.value = true
  try {
    const game = await $fetch<{ id: string }>('/api/games', { method: 'POST', body: { title: title.value.trim() } })
    router.push(`/master/games/${game.id}`)
  } catch (e: unknown) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Could not create game'
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-2xl items-center px-6 py-4">
        <NuxtLink to="/master" class="text-sm font-semibold text-slate-500 hover:text-slate-800">← Dashboard</NuxtLink>
      </div>
    </header>
    <main class="mx-auto max-w-2xl px-6 py-12">
      <form class="card flex flex-col gap-4 p-8" @submit.prevent="create">
        <h1 class="font-display text-2xl font-extrabold text-slate-800">Create Game</h1>
        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold text-slate-600">Game title</span>
          <input
            v-model="title"
            type="text"
            autofocus
            placeholder="Friday Night Quiz"
            class="rounded-xl border border-slate-200 px-4 py-3 text-lg"
          />
        </label>
        <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{{ error }}</p>
        <button
          type="submit"
          class="btn-touch min-h-[52px] rounded-2xl bg-indigo-600 text-lg font-display font-bold text-white shadow-lg disabled:opacity-50"
          :disabled="creating"
        >
          {{ creating ? 'Creating…' : 'Continue to Questions →' }}
        </button>
      </form>
    </main>
  </div>
</template>
