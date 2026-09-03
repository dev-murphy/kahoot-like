<script setup lang="ts">
const pin = ref('')
const router = useRouter()

function go() {
  const clean = pin.value.replace(/\D/g, '')
  if (clean.length === 6) router.push(`/join/${clean}`)
}
</script>

<template>
  <div class="app-bg flex min-h-screen flex-col items-center justify-center px-6 py-12 text-white">
    <div class="animate-pop-in flex w-full max-w-sm flex-col items-center gap-8 text-center">
      <div class="flex flex-col items-center gap-2">
        <div class="text-5xl">🎉</div>
        <h1 class="font-display text-4xl font-extrabold tracking-tight">QuizRush</h1>
        <p class="text-white/70">Team trivia, live tonight.</p>
      </div>

      <form class="w-full card flex flex-col gap-3 p-6" @submit.prevent="go">
        <label class="text-left text-sm font-bold uppercase tracking-wide text-slate-500">Game PIN</label>
        <input
          v-model="pin"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="6"
          placeholder="123456"
          class="w-full rounded-2xl border-2 border-indigo-100 px-4 py-4 text-center text-3xl font-display font-bold tracking-[0.3em] text-slate-800 focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          class="btn-touch min-h-[56px] rounded-2xl bg-indigo-600 text-lg font-display font-bold text-white shadow-lg disabled:opacity-40"
          :disabled="pin.replace(/\D/g, '').length !== 6"
        >
          Join Game
        </button>
      </form>

      <p class="text-sm text-white/60">Or scan the QR code provided by your Game Master.</p>

      <NuxtLink to="/master/login" class="text-sm font-semibold text-white/50 hover:text-white/80">
        Game Master login →
      </NuxtLink>
    </div>
  </div>
</template>
