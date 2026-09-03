<script setup lang="ts">
import type { QuestionEndedPayload, TeamQuestionResult } from '#shared/types'
import { QUIZ_ANSWER_COLORS } from '#shared/types'

const props = defineProps<{
  result?: TeamQuestionResult
  scoreAwarded?: number
  lastResults?: QuestionEndedPayload | null
}>()

const quizAnswer = computed(() => {
  if (props.lastResults?.question.type !== 'quiz') return null
  return props.lastResults.correctAnswer as { index: number; text: string }
})

const puzzleAnswer = computed(() => {
  if (props.lastResults?.question.type !== 'puzzle') return null
  return props.lastResults.correctAnswer as string[]
})

const simpleAnswer = computed(() => {
  const type = props.lastResults?.question.type
  if (!type || type === 'quiz' || type === 'puzzle' || type === 'pin_answer') return null
  const value = props.lastResults?.correctAnswer
  if (type === 'true_false') return value ? 'TRUE' : 'FALSE'
  return String(value)
})

const hasCorrectAnswer = computed(() => !!quizAnswer.value || !!puzzleAnswer.value || !!simpleAnswer.value)
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

    <div v-if="hasCorrectAnswer" class="card mt-2 w-full max-w-sm p-4">
      <p class="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Correct Answer</p>
      <p v-if="quizAnswer" class="flex items-center justify-center gap-2 font-display text-lg font-bold" :style="{ color: QUIZ_ANSWER_COLORS[quizAnswer.index] }">
        <span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: QUIZ_ANSWER_COLORS[quizAnswer.index] }" />
        {{ quizAnswer.text }}
      </p>
      <ol v-else-if="puzzleAnswer" class="flex flex-col gap-1 text-left text-sm font-semibold text-slate-700">
        <li v-for="(item, idx) in puzzleAnswer" :key="idx">{{ idx + 1 }}. {{ item }}</li>
      </ol>
      <p v-else class="font-display text-lg font-bold text-indigo-600">{{ simpleAnswer }}</p>
    </div>
  </div>
</template>
