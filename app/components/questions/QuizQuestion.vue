<script setup lang="ts">
import { QUIZ_ANSWER_COLORS } from '#shared/types'

const props = defineProps<{ choices: string[]; disabled?: boolean }>()
const emit = defineEmits<{ submit: [answer: number] }>()

const selected = ref<number | null>(null)

const shapes: Record<number, string> = {
  0: 'M12 3 L21 20 L3 20 Z', // triangle
  1: 'M12 2 L22 12 L12 22 L2 12 Z', // diamond
  2: '', // circle handled separately
  3: '' // square handled separately
}

function pick(idx: number) {
  if (props.disabled || selected.value !== null) return
  selected.value = idx
  emit('submit', idx)
}
</script>

<template>
  <div class="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
    <button
      v-for="(choice, idx) in choices"
      :key="idx"
      type="button"
      class="btn-touch card-answer flex min-h-[88px] items-center gap-3 rounded-2xl px-5 py-5 text-left text-lg font-bold text-white shadow-lg disabled:opacity-60"
      :style="{ backgroundColor: QUIZ_ANSWER_COLORS[idx] }"
      :disabled="disabled || selected !== null"
      :class="selected === idx ? 'ring-4 ring-white/80 scale-[0.98]' : ''"
      @click="pick(idx)"
    >
      <svg v-if="idx === 0" viewBox="0 0 24 24" class="h-7 w-7 shrink-0 fill-white/90"><path :d="shapes[0]" /></svg>
      <svg v-else-if="idx === 1" viewBox="0 0 24 24" class="h-7 w-7 shrink-0 fill-white/90"><path :d="shapes[1]" /></svg>
      <span v-else-if="idx === 2" class="h-7 w-7 shrink-0 rounded-full bg-white/90" />
      <span v-else class="h-7 w-7 shrink-0 rounded-md bg-white/90" />
      <span class="min-w-0 flex-1 break-words">{{ choice }}</span>
    </button>
  </div>
</template>
