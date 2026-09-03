<script setup lang="ts">
const props = defineProps<{
  startedAt: number
  endsAt: number
  paused?: boolean
  size?: 'sm' | 'lg'
}>()

const now = ref(Date.now())
let interval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  interval = setInterval(() => {
    if (!props.paused) now.value = Date.now()
  }, 100)
})
onUnmounted(() => {
  if (interval) clearInterval(interval)
})

const remainingMs = computed(() => Math.max(0, props.endsAt - now.value))
const remainingSeconds = computed(() => Math.ceil(remainingMs.value / 1000))
const totalMs = computed(() => Math.max(1, props.endsAt - props.startedAt))
const progress = computed(() => Math.max(0, Math.min(1, remainingMs.value / totalMs.value)))
const urgent = computed(() => remainingSeconds.value <= 5 && remainingSeconds.value > 0)
</script>

<template>
  <div class="flex flex-col items-center gap-1" :class="size === 'lg' ? 'w-full max-w-md' : 'w-40'">
    <div
      class="font-display font-bold tabular-nums transition-colors"
      :class="[
        size === 'lg' ? 'text-5xl' : 'text-2xl',
        urgent ? 'text-red-500 animate-wiggle' : 'text-white'
      ]"
    >
      {{ paused ? '⏸' : remainingSeconds }}
    </div>
    <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        class="h-full rounded-full transition-[width] duration-100 ease-linear"
        :class="urgent ? 'bg-red-500' : 'bg-indigo-500'"
        :style="{ width: `${progress * 100}%` }"
      />
    </div>
  </div>
</template>
