<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({ selector: 'html', valueDark: 'dark', valueLight: '' })
const toggleDark = useToggle(isDark)
</script>

<template>
  <ClientOnly>
    <button
      type="button"
      class="btn-touch flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleDark()"
    >
      <Icon :name="isDark ? 'tabler:sun' : 'tabler:moon'" class="h-5 w-5" />
    </button>
    <template #fallback>
      <span class="h-9 w-9 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800" />
    </template>
  </ClientOnly>
</template>
