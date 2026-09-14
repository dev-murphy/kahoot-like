<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue: string; length?: number; autofocus?: boolean }>(), {
  length: 6,
  autofocus: false
})
const emit = defineEmits<{ 'update:modelValue': [value: string]; complete: [value: string] }>()

const boxEls = ref<(HTMLInputElement | null)[]>([])
const digits = computed<string[]>(() => {
  const chars = props.modelValue.split('')
  return Array.from({ length: props.length }, (_, i) => chars[i] ?? '')
})

onMounted(() => {
  if (props.autofocus) boxEls.value[0]?.focus()
})

function setDigit(idx: number, value: string) {
  const clean = value.replace(/\D/g, '')
  const chars = props.modelValue.split('')
  while (chars.length < props.length) chars.push('')

  if (clean.length > 1) {
    for (let i = 0; i < clean.length && idx + i < props.length; i++) chars[idx + i] = clean[i]!
  } else {
    chars[idx] = clean
  }

  const next = chars.join('').slice(0, props.length)
  emit('update:modelValue', next)

  const nextIdx = Math.min(idx + clean.length, props.length - 1)
  nextTick(() => {
    if (next.length >= props.length) {
      boxEls.value[props.length - 1]?.blur()
      emit('complete', next)
    } else {
      boxEls.value[nextIdx]?.focus()
      boxEls.value[nextIdx]?.select()
    }
  })
}

function onInput(idx: number, e: Event) {
  const target = e.target as HTMLInputElement
  setDigit(idx, target.value)
}

function onKeydown(idx: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !digits.value[idx] && idx > 0) {
    e.preventDefault()
    const chars = props.modelValue.split('')
    chars[idx - 1] = ''
    emit('update:modelValue', chars.join(''))
    nextTick(() => boxEls.value[idx - 1]?.focus())
  } else if (e.key === 'ArrowLeft' && idx > 0) {
    e.preventDefault()
    boxEls.value[idx - 1]?.focus()
  } else if (e.key === 'ArrowRight' && idx < props.length - 1) {
    e.preventDefault()
    boxEls.value[idx + 1]?.focus()
  }
}

function onPaste(idx: number, e: ClipboardEvent) {
  const pasted = e.clipboardData?.getData('text')
  if (!pasted) return
  e.preventDefault()
  setDigit(idx, pasted)
}
</script>

<template>
  <div class="flex justify-center gap-2">
    <input
      v-for="(d, idx) in digits"
      :key="idx"
      :ref="(el) => (boxEls[idx] = el as HTMLInputElement)"
      :value="d"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="1"
      autocomplete="one-time-code"
      class="h-14 w-11 rounded-2xl border-2 border-indigo-100 text-center text-2xl font-display font-bold text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white sm:h-16 sm:w-12 sm:text-3xl"
      @input="onInput(idx, $event)"
      @keydown="onKeydown(idx, $event)"
      @paste="onPaste(idx, $event)"
      @focus="($event.target as HTMLInputElement).select()"
    />
  </div>
</template>
