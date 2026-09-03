<script setup lang="ts">
import type { Player, Team } from '#shared/types'

const props = defineProps<{ gameId: string; players: Player[]; teams: Team[] }>()
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
    <div v-if="players.length === 0" class="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
      No players have joined yet.
    </div>
    <div
      v-for="player in players"
      :key="player.id"
      class="flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-900/5"
    >
      <span class="h-2.5 w-2.5 shrink-0 rounded-full" :class="player.connected ? 'bg-emerald-500' : 'bg-slate-300'" />
      <span class="flex-1 truncate font-semibold text-slate-800">{{ player.name }}</span>
      <span
        v-if="teamOf(player)"
        class="hidden rounded-full px-2 py-0.5 text-xs font-bold text-white sm:inline"
        :style="{ backgroundColor: teamOf(player)!.color }"
      >
        {{ teamOf(player)!.name }}
      </span>
      <select
        :value="player.teamId ?? ''"
        class="rounded-lg border border-slate-200 px-2 py-1 text-sm"
        @change="assign(player, ($event.target as HTMLSelectElement).value)"
      >
        <option value="">Unassigned</option>
        <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <button type="button" class="text-slate-300 hover:text-red-500" title="Remove player" @click="kick(player)">✕</button>
    </div>
  </div>
</template>
