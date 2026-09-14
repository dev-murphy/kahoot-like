<script setup lang="ts">
const props = defineProps<{
  wordCount: number
  wordBank: string[]
  disabled?: boolean
  retryToken?: number
}>()
const emit = defineEmits<{ submit: [answer: string[]] }>()

const chosen = ref<string[]>([])
const bankRemaining = ref<string[]>([...props.wordBank])
const submitted = ref(false)

watch(
  () => props.retryToken,
  () => {
    submitted.value = false
  }
)

function chooseWord(word: string, bankIdx: number) {
  if (props.disabled || submitted.value) return
  chosen.value = [...chosen.value, word]
  bankRemaining.value = bankRemaining.value.filter((_, idx) => idx !== bankIdx)
}

function removeChosen(idx: number) {
  if (props.disabled || submitted.value) return
  const word = chosen.value[idx]
  if (word == null) return
  chosen.value = chosen.value.filter((_, i) => i !== idx)
  bankRemaining.value = [...bankRemaining.value, word]
}

const complete = computed(() => chosen.value.length === props.wordCount)

function submit() {
  if (props.disabled || submitted.value || !complete.value) return
  submitted.value = true
  emit('submit', chosen.value)
}
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-5">
    <p class="text-center text-sm font-medium text-slate-500">Tap words below to build the sentence</p>

    <div class="card flex min-h-[4rem] flex-wrap items-center gap-2 p-4">
      <button
        v-for="(word, idx) in chosen"
        :key="`${word}-${idx}`"
        type="button"
        class="btn-touch rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow disabled:opacity-70"
        :aria-label="`Word ${idx + 1}: ${word}, tap to remove`"
        :disabled="disabled || submitted"
        @click="removeChosen(idx)"
      >
        {{ word }}
      </button>
      <span v-if="chosen.length === 0" class="text-sm text-slate-400">Your sentence will appear here…</span>
    </div>

    <div class="flex flex-wrap justify-center gap-2">
      <button
        v-for="(word, idx) in bankRemaining"
        :key="`${word}-${idx}`"
        type="button"
        class="btn-touch rounded-xl bg-white px-4 py-2 font-semibold text-slate-700 shadow ring-1 ring-slate-900/5 disabled:opacity-50"
        :disabled="disabled || submitted"
        @click="chooseWord(word, idx)"
      >
        {{ word }}
      </button>
    </div>

    <button
      type="button"
      class="btn-touch min-h-[64px] w-full rounded-2xl bg-indigo-600 text-xl font-display font-bold text-white shadow-lg disabled:opacity-50"
      :disabled="disabled || submitted || !complete"
      @click="submit"
    >
      Check Answer
    </button>
  </div>
</template>
