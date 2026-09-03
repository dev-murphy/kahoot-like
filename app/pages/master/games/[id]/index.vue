<script setup lang="ts">
import type { Game, Player, PublicQuestion, Question, Team } from '#shared/types'
import { sanitizeQuestionClient } from '~/utils/previewSanitize'
import QuizQuestion from '~/components/questions/QuizQuestion.vue'
import TrueFalseQuestion from '~/components/questions/TrueFalseQuestion.vue'
import TypeAnswerQuestion from '~/components/questions/TypeAnswerQuestion.vue'
import SliderQuestion from '~/components/questions/SliderQuestion.vue'
import PinAnswerQuestion from '~/components/questions/PinAnswerQuestion.vue'
import PuzzleQuestion from '~/components/questions/PuzzleQuestion.vue'

definePageMeta({ middleware: 'master-auth' })

const previewComponents: Record<string, unknown> = {
  quiz: QuizQuestion,
  true_false: TrueFalseQuestion,
  type_answer: TypeAnswerQuestion,
  slider: SliderQuestion,
  pin_answer: PinAnswerQuestion,
  puzzle: PuzzleQuestion
}

const route = useRoute()
const router = useRouter()
const gameId = String(route.params.id)

const game = ref<Game | null>(null)
const questions = ref<Question[]>([])
const teams = ref<Team[]>([])
const players = ref<Player[]>([])
const loadError = ref('')
const titleDraft = ref('')

const authedFetch = useAuthedFetch()

async function refresh() {
  const data = await authedFetch<{ game: Game; questions: Question[]; teams: Team[]; players: Player[] }>(
    `/api/games/${gameId}`
  )
  game.value = data.game
  questions.value = data.questions
  teams.value = data.teams
  players.value = data.players
  titleDraft.value = data.game.title
}

try {
  await refresh()
} catch (e: unknown) {
  loadError.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Game not found'
}
let titleTimer: ReturnType<typeof setTimeout> | null = null
watch(titleDraft, (v) => {
  if (!game.value) return
  if (titleTimer) clearTimeout(titleTimer)
  titleTimer = setTimeout(async () => {
    if (v.trim() && v.trim() !== game.value!.title) {
      await $fetch(`/api/games/${gameId}`, { method: 'PUT', body: { title: v.trim() } })
      if (game.value) game.value.title = v.trim()
    }
  }, 600)
})

const showEditor = ref(false)
const editingQuestion = ref<Question | null>(null)
const previewQuestion = ref<Question | null>(null)
const importInput = ref<HTMLInputElement | null>(null)
const importing = ref(false)
const importError = ref('')

const selectMode = ref(false)
const selectedIds = ref<Set<string>>(new Set())
const bulkDeleting = ref(false)

const TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  quiz: { label: 'Quiz', icon: '🟥🟦' },
  true_false: { label: 'True or False', icon: '✓✕' },
  type_answer: { label: 'Type Answer', icon: '⌨️' },
  slider: { label: 'Slider', icon: '🎚️' },
  pin_answer: { label: 'Pin Answer', icon: '📍' },
  puzzle: { label: 'Puzzle', icon: '🧩' }
}

function openAdd() {
  editingQuestion.value = null
  showEditor.value = true
}
function openEdit(q: Question) {
  editingQuestion.value = q
  showEditor.value = true
}
async function onSaved() {
  showEditor.value = false
  editingQuestion.value = null
  await refresh()
}

function openImport() {
  importError.value = ''
  importInput.value?.click()
}

async function onImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  importError.value = ''
  importing.value = true
  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    const questions = Array.isArray(parsed) ? parsed : parsed?.questions
    if (!Array.isArray(questions)) throw new Error('JSON must be an array of questions or an object with a "questions" array')

    await $fetch(`/api/games/${gameId}/questions/import`, { method: 'POST', body: { questions } })
    await refresh()
  } catch (err: unknown) {
    importError.value =
      (err as { data?: { statusMessage?: string } })?.data?.statusMessage ??
      (err as { message?: string })?.message ??
      'Failed to import questions'
  } finally {
    importing.value = false
  }
}

async function deleteQuestion(q: Question) {
  if (!confirm('Delete this question?')) return
  await $fetch(`/api/games/${gameId}/questions/${q.id}`, { method: 'DELETE' })
  await refresh()
}

function toggleSelectMode() {
  selectMode.value = !selectMode.value
  selectedIds.value = new Set()
}

function toggleSelected(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function toggleSelectAll() {
  selectedIds.value =
    selectedIds.value.size === questions.value.length ? new Set() : new Set(questions.value.map((q) => q.id))
}

async function bulkDelete() {
  const count = selectedIds.value.size
  if (count === 0) return
  if (!confirm(`Delete ${count} selected question${count === 1 ? '' : 's'}?`)) return
  bulkDeleting.value = true
  try {
    await $fetch(`/api/games/${gameId}/questions/bulk-delete`, {
      method: 'POST',
      body: { ids: [...selectedIds.value] }
    })
    selectMode.value = false
    selectedIds.value = new Set()
    await refresh()
  } finally {
    bulkDeleting.value = false
  }
}

async function moveQuestion(idx: number, dir: -1 | 1) {
  const target = idx + dir
  if (target < 0 || target >= questions.value.length) return
  const copy = [...questions.value]
  ;[copy[idx], copy[target]] = [copy[target]!, copy[idx]!]
  questions.value = copy
  await $fetch(`/api/games/${gameId}/questions/reorder`, {
    method: 'POST',
    body: { orderedIds: copy.map((q) => q.id) }
  })
}

const launching = ref(false)
async function launch() {
  launching.value = true
  try {
    await $fetch(`/api/games/${gameId}/launch`, { method: 'POST' })
    router.push(`/master/games/${gameId}/lobby`)
  } finally {
    launching.value = false
  }
}

const restarting = ref(false)
async function restart() {
  if (!confirm('Restart this game? Scores and answers will be reset.')) return
  restarting.value = true
  try {
    await $fetch(`/api/games/${gameId}/restart`, { method: 'POST' })
    router.push(`/master/games/${gameId}/lobby`)
  } finally {
    restarting.value = false
  }
}

const previewPublic = computed<PublicQuestion | null>(() =>
  previewQuestion.value ? sanitizeQuestionClient(previewQuestion.value) : null
)
</script>

<template>
  <div v-if="loadError" class="flex min-h-screen items-center justify-center">
    <p class="text-slate-500">{{ loadError }}</p>
  </div>
  <div v-else-if="game" class="min-h-screen bg-slate-50 pb-24">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <NuxtLink to="/master" class="text-sm font-semibold text-slate-500 hover:text-slate-800">← Dashboard</NuxtLink>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{{ game.status }}</span>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-6 py-8">
      <label class="mb-8 block">
        <span class="text-sm font-semibold text-slate-500">Game title</span>
        <input
          v-model="titleDraft"
          type="text"
          class="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-display text-2xl font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      <section class="mb-10">
        <h2 class="mb-3 font-display text-lg font-bold text-slate-800">Teams</h2>
        <TeamManager :game-id="gameId" :teams="teams" :players="players" :pin="game.pin" @changed="refresh" />
      </section>

      <section>
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-display text-lg font-bold text-slate-800">Questions ({{ questions.length }})</h2>
          <button
            v-if="questions.length > 0"
            type="button"
            class="text-xs font-bold text-indigo-500 hover:underline"
            @click="toggleSelectMode"
          >
            {{ selectMode ? 'Cancel' : 'Select' }}
          </button>
        </div>

        <div v-if="selectMode" class="mb-3 flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-2">
          <label class="flex items-center gap-2 text-sm font-semibold text-indigo-700">
            <input
              type="checkbox"
              :checked="selectedIds.size === questions.length && questions.length > 0"
              @change="toggleSelectAll"
            />
            {{ selectedIds.size }} selected
          </label>
          <button
            type="button"
            class="btn-touch rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
            :disabled="selectedIds.size === 0 || bulkDeleting"
            @click="bulkDelete"
          >
            {{ bulkDeleting ? 'Deleting…' : `Delete Selected (${selectedIds.size})` }}
          </button>
        </div>

        <div class="flex flex-col gap-3">
          <div v-for="(q, idx) in questions" :key="q.id" class="card flex items-center gap-3 p-4">
            <input
              v-if="selectMode"
              type="checkbox"
              class="h-5 w-5 shrink-0"
              :checked="selectedIds.has(q.id)"
              @change="toggleSelected(q.id)"
            />
            <div v-else class="flex flex-col gap-0.5 text-slate-300">
              <button type="button" class="disabled:opacity-20" :disabled="idx === 0" @click="moveQuestion(idx, -1)">▲</button>
              <button type="button" class="disabled:opacity-20" :disabled="idx === questions.length - 1" @click="moveQuestion(idx, 1)">▼</button>
            </div>
            <span class="text-2xl">{{ TYPE_LABELS[q.type]?.icon }}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold text-slate-800">{{ idx + 1 }}. {{ q.text }}</p>
              <p class="text-xs text-slate-400">{{ TYPE_LABELS[q.type]?.label }} · {{ q.timeLimit }}s · {{ q.points }} pts</p>
            </div>
            <div class="flex shrink-0 gap-2">
              <button type="button" class="btn-touch rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600" @click="previewQuestion = q">
                Preview
              </button>
              <button type="button" class="btn-touch rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600" @click="openEdit(q)">
                Edit
              </button>
              <button type="button" class="btn-touch rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500" @click="deleteQuestion(q)">
                Delete
              </button>
            </div>
          </div>

          <div v-if="questions.length === 0" class="card p-8 text-center text-slate-400">No questions yet.</div>

          <div class="flex gap-3">
            <button
              type="button"
              class="btn-touch flex-1 rounded-2xl border-2 border-dashed border-indigo-200 py-5 font-display font-bold text-indigo-500 hover:bg-indigo-50"
              @click="openAdd"
            >
              + Add Question
            </button>
            <button
              type="button"
              class="btn-touch flex-1 rounded-2xl border-2 border-dashed border-slate-200 py-5 font-display font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50"
              :disabled="importing"
              @click="openImport"
            >
              {{ importing ? 'Uploading…' : '⬆ Upload JSON' }}
            </button>
            <input ref="importInput" type="file" accept=".json,application/json" class="hidden" @change="onImportFile" />
          </div>
          <p v-if="importError" class="text-sm font-semibold text-red-500">{{ importError }}</p>
        </div>
      </section>
    </main>

    <div class="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <p class="text-sm text-slate-400">{{ questions.length }} question{{ questions.length === 1 ? '' : 's' }} saved</p>
        <button
          v-if="game.status === 'FINISHED'"
          type="button"
          class="btn-touch rounded-2xl bg-indigo-600 px-6 py-3 font-display font-bold text-white shadow-lg disabled:opacity-40"
          :disabled="restarting"
          @click="restart"
        >
          {{ restarting ? 'Restarting…' : 'Restart Game →' }}
        </button>
        <button
          v-else
          type="button"
          class="btn-touch rounded-2xl bg-emerald-600 px-6 py-3 font-display font-bold text-white shadow-lg disabled:opacity-40"
          :disabled="questions.length === 0 || launching"
          @click="launch"
        >
          {{ launching ? 'Launching…' : 'Launch Game →' }}
        </button>
      </div>
    </div>

    <!-- Question editor modal -->
    <div v-if="showEditor" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" @click.self="showEditor = false">
      <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <QuestionEditor :game-id="gameId" :question="editingQuestion" @saved="onSaved" @cancel="showEditor = false" />
      </div>
    </div>

    <!-- Preview modal -->
    <div v-if="previewQuestion && previewPublic" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4" @click.self="previewQuestion = null">
      <div class="flex max-h-[90vh] w-full max-w-xl flex-col items-center gap-4 overflow-y-auto rounded-3xl bg-white p-8">
        <p class="font-display text-2xl font-bold text-slate-800">{{ previewQuestion.text }}</p>
        <component :is="previewComponents[previewQuestion.type]" v-bind="previewPublic.config" disabled />
        <button type="button" class="btn-touch rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600" @click="previewQuestion = null">
          Close preview
        </button>
      </div>
    </div>
  </div>
</template>
