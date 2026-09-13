<script setup lang="ts">
const props = defineProps<{ min: number; max: number; step?: number; disabled?: boolean; retryToken?: number }>()
const emit = defineEmits<{ submit: [answer: number] }>()

const value = ref(Math.round((props.min + props.max) / 2))
const submitted = ref(false)

watch(
  () => props.retryToken,
  () => {
    submitted.value = false
  }
)

function clamp(value: number) {
  return Math.min(props.max, Math.max(props.min, value))
}

function adjust(delta: number) {
  if (props.disabled || submitted.value) return
  value.value = clamp(value.value + delta)
}

function submit() {
  if (props.disabled || submitted.value) return
  submitted.value = true
  emit('submit', value.value)
}
</script>

<template>
  <div class="flex w-full max-w-lg flex-col items-center gap-6">
    <div class="font-display text-6xl font-extrabold text-indigo-700">{{ value }}</div>
    <div class="flex w-full items-center gap-3">
      <button
        type="button"
        class="btn-touch flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 disabled:opacity-40"
        :disabled="disabled || submitted || value <= min"
        aria-label="Decrease by 1"
        @click="adjust(-1)"
      >
        −
      </button>
      <input
        v-model.number="value"
        type="range"
        :min="min"
        :max="max"
        :step="step ?? 1"
        class="slider-range h-4 w-full cursor-pointer appearance-none rounded-full bg-indigo-200 accent-indigo-600 disabled:opacity-60"
        :disabled="disabled || submitted"
      />
      <button
        type="button"
        class="btn-touch flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 disabled:opacity-40"
        :disabled="disabled || submitted || value >= max"
        aria-label="Increase by 1"
        @click="adjust(1)"
      >
        +
      </button>
    </div>
    <div class="flex w-full justify-between text-sm font-semibold text-slate-500">
      <span>{{ min }}</span>
      <span>{{ max }}</span>
    </div>
    <button
      type="button"
      class="btn-touch min-h-[64px] w-full rounded-2xl bg-indigo-600 text-xl font-display font-bold text-white shadow-lg disabled:opacity-50"
      :disabled="disabled || submitted"
      @click="submit"
    >
      Submit
    </button>
  </div>
</template>

<style scoped>
.slider-range::-webkit-slider-thumb {
  appearance: none;
  height: 36px;
  width: 36px;
  border-radius: 9999px;
  background: #4f46e5;
  border: 4px solid white;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.35);
  cursor: pointer;
}

.slider-range::-moz-range-thumb {
  height: 36px;
  width: 36px;
  border-radius: 9999px;
  background: #4f46e5;
  border: 4px solid white;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.35);
  cursor: pointer;
}

.slider-range:disabled::-webkit-slider-thumb {
  opacity: 0.6;
}

.slider-range:disabled::-moz-range-thumb {
  opacity: 0.6;
}
</style>
