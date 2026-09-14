<script setup lang="ts">
import type { QuestionType } from '#shared/types'
import { QUESTION_TYPES } from '~/utils/questionTypeMeta'

defineProps<{ modelValue: QuestionType | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: QuestionType] }>()
</script>

<template>
  <div>
    <h2 class="mb-4 text-center font-display text-2xl font-extrabold text-slate-800 dark:text-slate-100">Test knowledge</h2>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <button
        v-for="t in QUESTION_TYPES"
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
        <img :src="t.icon" :alt="t.label" class="h-[2.875rem] w-[2.875rem]" />
        <span class="font-display font-bold text-slate-800 dark:text-slate-100">{{ t.label }}</span>
        <span class="text-xs text-slate-400 dark:text-slate-500">{{ t.blurb }}</span>
      </button>
    </div>
  </div>
</template>
