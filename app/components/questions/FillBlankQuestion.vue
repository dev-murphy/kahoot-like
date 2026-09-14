<script setup lang="ts">
import { splitTemplate } from '#shared/utils/fillBlank'

const props = defineProps<{
  template: string
  blankCount: number
  wordBank: string[]
  disabled?: boolean
  retryToken?: number
}>()
const emit = defineEmits<{ submit: [answer: (string | null)[]] }>()

const filled = ref<(string | null)[]>(Array(props.blankCount).fill(null))
const bankRemaining = ref<string[]>([...props.wordBank])
const submitted = ref(false)

watch(
  () => props.retryToken,
  () => {
    submitted.value = false
  }
)

type Segment = { type: 'text'; value: string } | { type: 'blank'; index: number }

const segments = computed<Segment[]>(() => {
  let blankIdx = 0
  return splitTemplate(props.template).map((seg) =>
    seg === null ? { type: 'blank' as const, index: blankIdx++ } : { type: 'text' as const, value: seg }
  )
})

function placeWord(word: string, bankIdx: number) {
  if (props.disabled || submitted.value) return
  const slot = filled.value.indexOf(null)
  if (slot === -1) return
  const copy = [...filled.value]
  copy[slot] = word
  filled.value = copy
  bankRemaining.value = bankRemaining.value.filter((_, idx) => idx !== bankIdx)
}

function clearSlot(slotIdx: number) {
  if (props.disabled || submitted.value) return
  const word = filled.value[slotIdx]
  if (word == null) return
  const copy = [...filled.value]
  copy[slotIdx] = null
  filled.value = copy
  bankRemaining.value = [...bankRemaining.value, word]
}

const allFilled = computed(() => filled.value.every((w) => w != null))

function submit() {
  if (props.disabled || submitted.value || !allFilled.value) return
  submitted.value = true
  emit('submit', filled.value)
}
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-5">
    <p class="text-center text-sm font-medium text-slate-500">Tap words below to fill in the blanks</p>

    <div class="card flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 p-5 text-lg font-semibold leading-relaxed text-slate-800 dark:text-slate-100">
      <template v-for="(segment, idx) in segments" :key="idx">
        <span v-if="segment.type === 'text'" class="whitespace-pre-wrap">{{ segment.value }}</span>
        <button
          v-else
          type="button"
          class="btn-touch inline-flex min-w-[5rem] items-center justify-center rounded-lg border-2 border-dashed px-3 py-1.5 font-bold"
          :class="
            filled[segment.index] != null
              ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
              : 'border-slate-300 text-slate-300 dark:border-slate-600 dark:text-slate-600'
          "
          :aria-label="
            filled[segment.index] != null
              ? `Blank ${segment.index + 1}: ${filled[segment.index]}, tap to clear`
              : `Blank ${segment.index + 1}, empty`
          "
          :disabled="disabled || submitted"
          @click="clearSlot(segment.index)"
        >
          {{ filled[segment.index] ?? '____' }}
        </button>
      </template>
    </div>

    <div class="flex flex-wrap justify-center gap-2">
      <button
        v-for="(word, idx) in bankRemaining"
        :key="`${word}-${idx}`"
        type="button"
        class="btn-touch rounded-xl bg-white px-4 py-2 font-semibold text-slate-700 shadow ring-1 ring-slate-900/5 disabled:opacity-50"
        :disabled="disabled || submitted"
        @click="placeWord(word, idx)"
      >
        {{ word }}
      </button>
    </div>

    <button
      type="button"
      class="btn-touch min-h-[64px] w-full rounded-2xl bg-indigo-600 text-xl font-display font-bold text-white shadow-lg disabled:opacity-50"
      :disabled="disabled || submitted || !allFilled"
      @click="submit"
    >
      Check Answer
    </button>
  </div>
</template>
