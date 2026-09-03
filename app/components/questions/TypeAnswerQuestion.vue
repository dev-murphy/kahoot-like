<script setup lang="ts">
const props = defineProps<{ disabled?: boolean }>()
const emit = defineEmits<{ submit: [answer: string] }>()

const value = ref('')
const submitted = ref(false)

function submit() {
  if (props.disabled || submitted.value || !value.value.trim()) return
  submitted.value = true
  emit('submit', value.value.trim())
}

</script>

<template>
  <form class="flex w-full max-w-lg flex-col gap-4" @submit.prevent="submit">
    <input
      v-model="value"
      type="text"
      inputmode="text"
      autocomplete="off"
      placeholder="Type your answer..."
      class="w-full rounded-2xl border-2 border-indigo-200 bg-white px-5 py-4 text-center text-xl font-semibold text-slate-800 shadow-inner focus:border-indigo-500 focus:outline-none disabled:opacity-60"
      :disabled="disabled || submitted"
      maxlength="80"
    />
    <button
      type="submit"
      class="btn-touch min-h-[64px] rounded-2xl bg-indigo-600 text-xl font-display font-bold text-white shadow-lg disabled:opacity-50"
      :disabled="disabled || submitted || !value.trim()"
    >
      Submit
    </button>
  </form>
</template>
