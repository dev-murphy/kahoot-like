<script setup lang="ts">
import type { Player, Team } from '#shared/types'
import { TEAM_COLORS } from '#shared/types'
import { slugify } from '#shared/utils/slug'

const props = defineProps<{
  gameId: string
  teams: Team[]
  players: Player[]
  pin?: string | null
}>()
const emit = defineEmits<{ changed: [] }>()

const newTeamName = ref('')
const copiedTeamId = ref<string | null>(null)

function memberCount(teamId: string) {
  return props.players.filter((p) => p.teamId === teamId).length
}

async function addTeam() {
  const name = newTeamName.value.trim()
  if (!name) return
  await $fetch(`/api/games/${props.gameId}/teams`, { method: 'POST', body: { name } })
  newTeamName.value = ''
  emit('changed')
}

async function renameTeam(team: Team, name: string) {
  if (!name.trim() || name === team.name) return
  await $fetch(`/api/games/${props.gameId}/teams/${team.id}`, { method: 'PUT', body: { name: name.trim() } })
  emit('changed')
}

async function recolorTeam(team: Team, color: string) {
  await $fetch(`/api/games/${props.gameId}/teams/${team.id}`, { method: 'PUT', body: { color } })
  emit('changed')
}

async function removeTeam(team: Team) {
  if (!confirm(`Delete ${team.name}? Members will become unassigned.`)) return
  await $fetch(`/api/games/${props.gameId}/teams/${team.id}`, { method: 'DELETE' })
  emit('changed')
}

function joinLink(team: Team): string {
  if (typeof window === 'undefined' || !props.pin) return ''
  return `${window.location.origin}/join/${props.pin}/team/${slugify(team.name)}`
}

async function copyLink(team: Team) {
  const link = joinLink(team)
  if (!link) return
  await navigator.clipboard.writeText(link)
  copiedTeamId.value = team.id
  setTimeout(() => (copiedTeamId.value = null), 1500)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-2">
      <input
        v-model="newTeamName"
        type="text"
        placeholder="New team name"
        class="flex-1 rounded-xl border border-slate-200 px-4 py-2"
        @keyup.enter="addTeam"
      />
      <button type="button" class="btn-touch rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white" @click="addTeam">
        + Add Team
      </button>
    </div>

    <div v-if="teams.length === 0" class="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
      No teams yet. Add one above.
    </div>

    <div v-for="team in teams" :key="team.id" class="card flex flex-col gap-2 p-4">
      <div class="flex items-center gap-3">
        <span class="h-6 w-6 shrink-0 rounded-full ring-2 ring-white shadow" :style="{ backgroundColor: team.color }" />
        <input
          :value="team.name"
          type="text"
          class="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 font-display text-lg font-bold text-slate-800 hover:border-slate-200 focus:border-indigo-400 focus:outline-none"
          @change="renameTeam(team, ($event.target as HTMLInputElement).value)"
        />
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          {{ memberCount(team.id) }} player{{ memberCount(team.id) === 1 ? '' : 's' }}
        </span>
        <button type="button" class="text-slate-300 hover:text-red-500" @click="removeTeam(team)">✕</button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="c in TEAM_COLORS"
          :key="c.value"
          type="button"
          class="h-6 w-6 rounded-full ring-offset-2 transition"
          :class="team.color === c.value ? 'ring-2 ring-slate-800' : ''"
          :style="{ backgroundColor: c.value }"
          :title="c.name"
          @click="recolorTeam(team, c.value)"
        />
        <button
          v-if="pin"
          type="button"
          class="ml-auto rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
          @click="copyLink(team)"
        >
          {{ copiedTeamId === team.id ? 'Copied!' : 'Copy join link' }}
        </button>
      </div>
    </div>
  </div>
</template>
