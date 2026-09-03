<script setup lang="ts">
import type { TeamQuestionResult } from '#shared/types'

defineProps<{ result?: TeamQuestionResult; scoreAwarded?: number }>()
</script>

<template>
  <div class="animate-pop-in flex flex-col items-center gap-3 py-8 text-center">
    <template v-if="result?.correct">
      <div class="text-6xl">🎉</div>
      <p class="font-display text-3xl font-extrabold text-emerald-600">Your team got it!</p>
      <p v-if="scoreAwarded" class="text-lg font-semibold text-slate-600">+{{ scoreAwarded.toLocaleString() }} points</p>
    </template>
    <template v-else>
      <div class="text-6xl">😬</div>
      <p class="font-display text-3xl font-extrabold text-red-500">Your team needs another answer!</p>
    </template>
  </div>
</template>
