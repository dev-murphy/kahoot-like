<script setup lang="ts">
const props = defineProps<{ min: number; max: number; step?: number; disabled?: boolean }>()
const emit = defineEmits<{ submit: [answer: number] }>()

const value = ref(Math.round((props.min + props.max) / 2))
const submitted = ref(false)

function submit() {
  if (props.disabled || submitted.value) return
  submitted.value = true
  emit('submit', value.value)
}
</script>

<template>
  <div class="flex w-full max-w-lg flex-col items-center gap-6">
    <div class="font-display text-6xl font-extrabold text-indigo-700">{{ value }}</div>
    <input
      v-model.number="value"
      type="range"
      :min="min"
      :max="max"
      :step="step ?? 1"
      class="h-4 w-full cursor-pointer appearance-none rounded-full bg-indigo-200 accent-indigo-600 disabled:opacity-60"
      :disabled="disabled || submitted"
    />
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
