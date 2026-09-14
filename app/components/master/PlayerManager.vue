<script setup lang="ts">
import type { GameMode, Player, Team } from '#shared/types'

const props = withDefaults(defineProps<{ gameId: string; players: Player[]; teams: Team[]; mode?: GameMode }>(), {
  mode: 'TEAM'
})
const emit = defineEmits<{ changed: [] }>()

function teamOf(player: Player) {
  return props.teams.find((t) => t.id === player.teamId) ?? null
}

async function assign(player: Player, teamId: string) {
  await $fetch(`/api/games/${props.gameId}/players/${player.id}`, {
    method: 'PUT',
    body: { teamId: teamId || null }
  })
  emit('changed')
}

async function kick(player: Player) {
  if (!confirm(`Remove ${player.name} from the game?`)) return
  await $fetch(`/api/games/${props.gameId}/players/${player.id}`, { method: 'DELETE' })
  emit('changed')
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-if="players.length === 0"
      class="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400 dark:bg-slate-800 dark:text-slate-500"
    >
      No players have joined yet.
    </div>
    <div
      v-for="player in players"
      :key="player.id"
      class="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-800 dark:ring-white/10"
    >
      <span class="h-2.5 w-2.5 shrink-0 rounded-full" :class="player.connected ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'" />
      <span class="min-w-0 flex-1 truncate font-semibold text-slate-800 dark:text-slate-100">{{ player.name }}</span>
      <template v-if="mode !== 'INDIVIDUAL'">
        <span
          v-if="teamOf(player)"
          class="hidden rounded-full px-2 py-0.5 text-xs font-bold text-white sm:inline"
          :style="{ backgroundColor: teamOf(player)!.color }"
        >
          {{ teamOf(player)!.name }}
        </span>
        <select
          :value="player.teamId ?? ''"
          class="max-w-[8rem] shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-sm sm:max-w-[10rem] dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          @change="assign(player, ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Unassigned</option>
          <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
      </template>
      <button
        type="button"
        class="shrink-0 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400"
        title="Remove player"
        @click="kick(player)"
      >
        <Icon name="tabler:x" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
