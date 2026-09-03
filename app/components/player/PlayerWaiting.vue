<script setup lang="ts">
defineProps<{ message?: string }>()
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-10 text-center">
    <div class="flex gap-2">
      <span class="h-3 w-3 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]" />
      <span class="h-3 w-3 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]" />
      <span class="h-3 w-3 animate-bounce rounded-full bg-indigo-500" />
    </div>
    <p class="font-display text-xl font-bold text-slate-700">{{ message ?? 'Waiting for your team…' }}</p>
  </div>
</template>
