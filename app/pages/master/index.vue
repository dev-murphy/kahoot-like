<script setup lang="ts">
definePageMeta({ middleware: 'master-auth' })

const store = useMasterStore()
const router = useRouter()
const deleting = ref<string | null>(null)

await store.fetchGames()

async function logout() {
  await store.logout()
  router.push('/master/login')
}

async function launchAndGo(id: string) {
  await $fetch(`/api/games/${id}/launch`, { method: 'POST' })
  router.push(`/master/games/${id}/lobby`)
}

async function removeGame(id: string) {
  if (!confirm('Delete this game permanently?')) return
  deleting.value = id
  try {
    await $fetch(`/api/games/${id}`, { method: 'DELETE' })
    await store.fetchGames()
  } finally {
    deleting.value = null
  }
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-600',
    LOBBY: 'bg-amber-100 text-amber-700',
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    QUESTION_ACTIVE: 'bg-emerald-100 text-emerald-700',
    QUESTION_RESULTS: 'bg-emerald-100 text-emerald-700',
    FINISHED: 'bg-indigo-100 text-indigo-700',
    CANCELLED: 'bg-red-100 text-red-700'
  }
  return map[status] ?? 'bg-slate-100 text-slate-600'
}

function continueLink(game: { id: string; status: string }) {
  if (game.status === 'DRAFT') return `/master/games/${game.id}`
  if (game.status === 'LOBBY') return `/master/games/${game.id}/lobby`
  if (game.status === 'FINISHED') return `/master/games/${game.id}/results`
  return `/master/games/${game.id}/play`
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-16">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <h1 class="font-display text-xl font-extrabold text-slate-800">Game Master</h1>
        <button type="button" class="text-sm font-semibold text-slate-500 hover:text-slate-800" @click="logout">Logout</button>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-6 py-8">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="font-display text-2xl font-bold text-slate-800">Your Games</h2>
        <NuxtLink
          to="/master/games/new"
          class="btn-touch rounded-2xl bg-indigo-600 px-5 py-3 font-display font-bold text-white shadow-lg"
        >
          + Create Game
        </NuxtLink>
      </div>

      <div v-if="store.games.length === 0" class="card p-10 text-center text-slate-400">
        No games yet. Create one to get started.
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div v-for="game in store.games" :key="game.id" class="card flex flex-col gap-3 p-5">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-display text-lg font-bold text-slate-800">{{ game.title }}</h3>
            <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold" :class="statusBadge(game.status)">
              {{ game.status.replace('_', ' ') }}
            </span>
          </div>
          <p class="text-sm text-slate-400">
            {{ game.questionCount }} question{{ game.questionCount === 1 ? '' : 's' }} · created
            {{ new Date(game.createdAt).toLocaleDateString() }}
          </p>
          <div class="mt-auto flex flex-wrap gap-2 pt-2">
            <NuxtLink :to="`/master/games/${game.id}`" class="btn-touch rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
              Edit
            </NuxtLink>
            <NuxtLink :to="continueLink(game)" class="btn-touch rounded-xl bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700">
              {{ game.status === 'DRAFT' ? 'Continue' : 'Open' }}
            </NuxtLink>
            <button
              v-if="game.status === 'DRAFT'"
              type="button"
              class="btn-touch rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
              :disabled="game.questionCount === 0"
              @click="launchAndGo(game.id)"
            >
              Launch
            </button>
            <button
              type="button"
              class="btn-touch ml-auto rounded-xl px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 disabled:opacity-40"
              :disabled="deleting === game.id"
              @click="removeGame(game.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
