<script setup lang="ts">
const props = defineProps<{ imageUrl: string; disabled?: boolean; retryToken?: number }>()
const emit = defineEmits<{ submit: [answer: { x: number; y: number }] }>()

const containerRef = ref<HTMLElement | null>(null)
const point = ref<{ x: number; y: number } | null>(null)
const submitted = ref(false)

watch(
  () => props.retryToken,
  () => {
    submitted.value = false
  }
)

function pick(e: MouseEvent | TouchEvent) {
  if (props.disabled || submitted.value || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX ?? 0 : e.clientX
  const clientY = 'touches' in e ? e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY ?? 0 : e.clientY
  const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
  point.value = { x, y }
}

function submit() {
  if (props.disabled || submitted.value || !point.value) return
  submitted.value = true
  emit('submit', point.value)
}
</script>

<template>
  <div class="flex w-full max-w-xl flex-col items-center gap-4">
    <div
      ref="containerRef"
      class="relative w-full touch-none select-none overflow-hidden rounded-2xl bg-slate-200 shadow-lg"
      @click="pick"
      @touchend.prevent="pick"
    >
      <img :src="imageUrl" alt="Question map" class="pointer-events-none block w-full" draggable="false" />
      <div
        v-if="point"
        class="pointer-events-none absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-pink-500/90 shadow-lg animate-pop-in"
        :style="{ left: point.x * 100 + '%', top: point.y * 100 + '%' }"
      />
    </div>
    <p class="text-sm font-medium text-slate-500">Tap the image to place your pin</p>
    <button
      type="button"
      class="btn-touch min-h-[64px] w-full rounded-2xl bg-indigo-600 text-xl font-display font-bold text-white shadow-lg disabled:opacity-50"
      :disabled="disabled || submitted || !point"
      @click="submit"
    >
      Submit
    </button>
  </div>
</template>
