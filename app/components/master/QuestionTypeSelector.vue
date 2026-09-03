<script setup lang="ts">
import type { QuestionType } from '#shared/types'

defineProps<{ modelValue: QuestionType | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: QuestionType] }>()

const types: { type: QuestionType; label: string; icon: string; blurb: string }[] = [
  { type: 'quiz', label: 'Quiz', icon: '🟥🟦', blurb: 'Multiple choice' },
  { type: 'true_false', label: 'True or false', icon: '✓✕', blurb: 'Two choices' },
  { type: 'type_answer', label: 'Type answer', icon: '⌨️', blurb: 'Free text' },
  { type: 'slider', label: 'Slider', icon: '🎚️', blurb: 'Pick a number' },
  { type: 'pin_answer', label: 'Pin answer', icon: '📍', blurb: 'Tap the map' },
  { type: 'puzzle', label: 'Puzzle', icon: '🧩', blurb: 'Put in order' }
]
</script>

<template>
  <div>
    <h2 class="mb-4 text-center font-display text-2xl font-extrabold text-slate-800">Test knowledge</h2>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <button
        v-for="t in types"
        :key="t.type"
        type="button"
        class="btn-touch card flex flex-col items-center gap-2 rounded-2xl px-4 py-6 text-center"
        :class="
          modelValue === t.type
            ? 'ring-4 ring-blue-500 ring-offset-2'
            : 'hover:ring-2 hover:ring-indigo-200'
        "
        @click="emit('update:modelValue', t.type)"
      >
        <span class="text-3xl">{{ t.icon }}</span>
        <span class="font-display font-bold text-slate-800">{{ t.label }}</span>
        <span class="text-xs text-slate-400">{{ t.blurb }}</span>
      </button>
    </div>
  </div>
</template>
