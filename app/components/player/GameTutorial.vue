<script setup lang="ts">
import { QUIZ_ANSWER_COLORS } from '#shared/types'

const emit = defineEmits<{ close: [] }>()

const steps = [
  {
    title: 'Multiple Choice',
    demo: 'quiz',
    description: 'Tap the color and shape that matches the answer you think is correct.'
  },
  {
    title: 'True or False',
    demo: 'true_false',
    description: 'Read the statement, then tap TRUE or FALSE.'
  },
  {
    title: 'Type an Answer',
    demo: 'type_answer',
    description: 'Type your answer into the box and tap Submit.'
  },
  {
    title: 'Slider',
    demo: 'slider',
    description: 'Drag the slider to your best guess. Use the − and + buttons to fine-tune by 1, then tap Submit.'
  },
  {
    title: 'Pin the Spot',
    demo: 'pin_answer',
    description: 'Tap anywhere on the image to drop your pin, then tap Submit.'
  },
  {
    title: 'Put in Order',
    demo: 'puzzle',
    description: 'Press and drag any card up or down to put the list in the right order, then tap Submit.'
  }
] as const

const stepIndex = ref(0)
const step = computed(() => steps[stepIndex.value]!)
const isLast = computed(() => stepIndex.value === steps.length - 1)

function next() {
  if (isLast.value) {
    emit('close')
    return
  }
  stepIndex.value++
}

function back() {
  if (stepIndex.value > 0) stepIndex.value--
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8">
    <div class="flex w-full max-w-md flex-col gap-5 rounded-3xl bg-white p-6 text-slate-800 shadow-2xl">
      <div class="flex items-center justify-between">
        <p class="text-xs font-bold uppercase tracking-wide text-indigo-500">How to Play</p>
        <button type="button" class="btn-touch text-sm font-semibold text-slate-400" @click="emit('close')">Skip</button>
      </div>

      <div class="flex flex-col items-center gap-4 text-center">
        <div class="flex h-28 w-full items-center justify-center rounded-2xl bg-indigo-50 p-3">
          <!-- Quiz demo -->
          <div v-if="step.demo === 'quiz'" class="grid w-full grid-cols-2 gap-2">
            <div v-for="c in QUIZ_ANSWER_COLORS" :key="c" class="h-9 rounded-lg" :style="{ backgroundColor: c }" />
          </div>

          <!-- True/False demo -->
          <div v-else-if="step.demo === 'true_false'" class="grid w-full grid-cols-2 gap-3">
            <div class="flex h-16 items-center justify-center rounded-xl bg-emerald-500 font-display text-lg font-extrabold text-white">✓</div>
            <div class="flex h-16 items-center justify-center rounded-xl bg-red-500 font-display text-lg font-extrabold text-white">✕</div>
          </div>

          <!-- Type answer demo -->
          <div v-else-if="step.demo === 'type_answer'" class="flex w-full flex-col items-center gap-2">
            <div class="flex h-10 w-full items-center rounded-xl border-2 border-indigo-200 bg-white px-3 text-sm text-slate-400">Type your answer...</div>
            <div class="rounded-lg bg-indigo-600 px-4 py-1 text-xs font-bold text-white">Submit</div>
          </div>

          <!-- Slider demo -->
          <div v-else-if="step.demo === 'slider'" class="flex w-full items-center gap-2">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">−</div>
            <div class="relative h-3 w-full rounded-full bg-indigo-200">
              <div class="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600" />
            </div>
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">+</div>
          </div>

          <!-- Pin answer demo -->
          <div v-else-if="step.demo === 'pin_answer'" class="relative h-full w-full overflow-hidden rounded-xl bg-slate-200">
            <div class="absolute left-[60%] top-[40%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-pink-500 shadow" />
          </div>

          <!-- Puzzle demo -->
          <div v-else-if="step.demo === 'puzzle'" class="flex w-full flex-col gap-1.5">
            <div v-for="n in 3" :key="n" class="flex h-7 items-center gap-2 rounded-lg bg-white px-2 shadow-sm ring-1 ring-slate-900/5">
              <span class="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">{{ n }}</span>
              <span class="h-1.5 flex-1 rounded-full bg-slate-200" />
              <span class="text-slate-300">⠿</span>
            </div>
          </div>
        </div>

        <h2 class="font-display text-xl font-extrabold">{{ step.title }}</h2>
        <p class="text-sm text-slate-500">{{ step.description }}</p>
      </div>

      <div class="flex items-center justify-between gap-2">
        <button
          type="button"
          class="btn-touch min-h-[48px] rounded-xl px-4 text-sm font-bold text-slate-500 disabled:opacity-30"
          :disabled="stepIndex === 0"
          @click="back"
        >
          Back
        </button>
        <div class="flex gap-1.5">
          <span
            v-for="(_, i) in steps"
            :key="i"
            class="h-1.5 w-1.5 rounded-full"
            :class="i === stepIndex ? 'bg-indigo-600' : 'bg-slate-200'"
          />
        </div>
        <button
          type="button"
          class="btn-touch min-h-[48px] rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white"
          @click="next"
        >
          {{ isLast ? "Let's Play!" : 'Next' }}
        </button>
      </div>
    </div>
  </div>
</template>
