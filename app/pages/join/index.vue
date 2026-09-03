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
    <form class="animate-pop-in w-full max-w-sm card flex flex-col gap-3 p-6" @submit.prevent="go">
      <h1 class="mb-1 text-center font-display text-2xl font-extrabold text-slate-800">Join a Game</h1>
      <label class="text-left text-sm font-bold uppercase tracking-wide text-slate-500">Game PIN</label>
      <input
        v-model="pin"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="6"
        placeholder="123456"
        autofocus
        class="w-full rounded-2xl border-2 border-indigo-100 px-4 py-4 text-center text-3xl font-display font-bold tracking-[0.3em] text-slate-800 focus:border-indigo-500 focus:outline-none"
      />
      <button
        type="submit"
        class="btn-touch min-h-[56px] rounded-2xl bg-indigo-600 text-lg font-display font-bold text-white shadow-lg disabled:opacity-40"
        :disabled="pin.replace(/\D/g, '').length !== 6"
      >
        Continue
      </button>
    </form>
  </div>
</template>
