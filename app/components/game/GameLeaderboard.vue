<script setup lang="ts">
import type { LeaderboardEntry } from '#shared/types'

defineProps<{ entries: LeaderboardEntry[]; compact?: boolean }>()

const medals = ['🥇', '🥈', '🥉']
</script>

<template>
  <ol class="flex flex-col gap-2">
    <li
      v-for="(entry, idx) in entries"
      :key="entry.teamId"
      class="animate-float-up flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm ring-1 ring-black/5"
      :class="idx === 0 ? 'bg-amber-50' : 'bg-white'"
      :style="{ animationDelay: `${idx * 60}ms` }"
    >
      <span class="w-8 shrink-0 text-center font-display text-xl">
        {{ idx < 3 ? medals[idx] : `#${idx + 1}` }}
      </span>
      <span class="h-4 w-4 shrink-0 rounded-full" :style="{ backgroundColor: entry.color }" />
      <span class="flex-1 truncate font-semibold text-slate-800" :class="compact ? 'text-sm' : 'text-lg'">
        {{ entry.name }}
      </span>
      <span class="flex items-center gap-1 font-display font-bold text-slate-900" :class="compact ? 'text-base' : 'text-xl'">
        {{ entry.score.toLocaleString() }}
        <template v-if="entry.previousRank && entry.previousRank !== entry.rank">
          <span v-if="entry.previousRank > entry.rank" class="text-xs text-emerald-500">▲</span>
          <span v-else class="text-xs text-red-400">▼</span>
        </template>
      </span>
    </li>
  </ol>
</template>
