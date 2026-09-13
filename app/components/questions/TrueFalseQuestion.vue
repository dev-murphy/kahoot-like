<script setup lang="ts">
const props = defineProps<{ disabled?: boolean; retryToken?: number }>()
const emit = defineEmits<{ submit: [answer: boolean] }>()
const selected = ref<boolean | null>(null)
const submitted = ref(false)

watch(
  () => props.retryToken,
  () => {
    submitted.value = false
  }
)

function pick(value: boolean) {
  if (props.disabled || submitted.value) return
  selected.value = value
  submitted.value = true
  emit('submit', value)
}
</script>

<template>
  <div class="grid w-full max-w-2xl grid-cols-2 gap-4">
    <button
      type="button"
      class="btn-touch flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-3xl bg-emerald-500 text-4xl font-display font-extrabold text-white shadow-lg disabled:opacity-60"
      :class="selected === true ? 'ring-4 ring-white/80 scale-[0.98]' : ''"
      :disabled="disabled || submitted"
      @click="pick(true)"
    >
      <span class="text-5xl">✓</span>
      TRUE
    </button>
    <button
      type="button"
      class="btn-touch flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-3xl bg-red-500 text-4xl font-display font-extrabold text-white shadow-lg disabled:opacity-60"
      :class="selected === false ? 'ring-4 ring-white/80 scale-[0.98]' : ''"
      :disabled="disabled || submitted"
      @click="pick(false)"
    >
      <span class="text-5xl">✕</span>
      FALSE
    </button>
  </div>
</template>
