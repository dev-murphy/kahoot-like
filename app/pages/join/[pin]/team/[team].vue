<script setup lang="ts">
interface JoinInfo {
  gameId: string
  title: string
  status: string
  joinable: boolean
  teams: { id: string; name: string; color: string; slug: string; memberCount: number }[]
  alreadyJoined: { id: string; name: string; teamId: string | null } | null
}

const route = useRoute()
const router = useRouter()
const pin = String(route.params.pin)
const teamSlug = String(route.params.team)

const info = ref<JoinInfo | null>(null)
const loadError = ref('')
const name = ref('')
const submitting = ref(false)
const submitError = ref('')

const { data, error } = await useFetch<JoinInfo>(`/api/join/${pin}`)
if (data.value) info.value = data.value
if (error.value) {
  loadError.value = (error.value.data as { statusMessage?: string } | undefined)?.statusMessage ?? 'Invalid Game PIN'
}

const team = computed(() => info.value?.teams.find((t) => t.slug === teamSlug) ?? null)

if (info.value?.alreadyJoined) {
  await navigateTo(`/game/${pin}`)
}

async function join() {
  submitError.value = ''
  if (name.value.trim().length < 2) {
    submitError.value = 'Please enter a name (2+ characters)'
    return
  }
  submitting.value = true
  try {
    await $fetch(`/api/join/${pin}`, {
      method: 'POST',
      body: { name: name.value.trim(), teamId: team.value?.id }
    })
    router.push(`/game/${pin}`)
  } catch (e: unknown) {
    submitError.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Could not join game'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="app-bg flex min-h-screen flex-col items-center justify-center px-6 py-12 text-white">
    <div v-if="loadError" class="animate-pop-in w-full max-w-sm card flex flex-col items-center gap-3 p-8 text-center">
      <div class="text-4xl">🚫</div>
      <h1 class="font-display text-xl font-bold text-slate-800">{{ loadError }}</h1>
    </div>

    <div v-else-if="info && !info.joinable" class="animate-pop-in w-full max-w-sm card flex flex-col items-center gap-3 p-8 text-center">
      <div class="text-4xl">⏳</div>
      <h1 class="font-display text-xl font-bold text-slate-800">{{ info.title }}</h1>
      <p class="text-slate-500">This game has already started. Ask the Game Master for a new PIN.</p>
    </div>

    <form v-else-if="info" class="animate-pop-in w-full max-w-sm card flex flex-col gap-4 p-6" @submit.prevent="join">
      <div class="text-center">
        <p class="text-xs font-bold uppercase tracking-widest text-indigo-400">Joining</p>
        <h1 class="font-display text-2xl font-extrabold text-slate-800">{{ info.title }}</h1>
        <p class="mt-1 text-sm text-slate-400">PIN {{ pin }}</p>
      </div>

      <div v-if="team" class="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-display font-bold text-white" :style="{ backgroundColor: team.color }">
        You're joining {{ team.name }}
      </div>
      <p v-else class="rounded-xl bg-amber-50 px-3 py-2 text-center text-sm text-amber-700">
        That team link looks invalid — you'll be assigned by the Game Master instead.
      </p>

      <label class="flex flex-col gap-1">
        <span class="text-sm font-bold uppercase tracking-wide text-slate-500">Your name</span>
        <input
          v-model="name"
          type="text"
          maxlength="24"
          autofocus
          placeholder="Murphy"
          class="w-full rounded-2xl border-2 border-indigo-100 px-4 py-3 text-center text-xl font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      <p v-if="submitError" class="rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600">{{ submitError }}</p>

      <button
        type="submit"
        class="btn-touch min-h-[56px] rounded-2xl bg-indigo-600 text-lg font-display font-bold text-white shadow-lg disabled:opacity-50"
        :disabled="submitting"
      >
        {{ submitting ? 'Joining…' : 'Join Game' }}
      </button>
    </form>
  </div>
</template>
