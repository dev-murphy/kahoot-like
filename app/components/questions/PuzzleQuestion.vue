<script setup lang="ts">
const props = defineProps<{ items: string[]; disabled?: boolean }>()
const emit = defineEmits<{ submit: [answer: string[]] }>()

const order = ref<string[]>([...props.items])
const submitted = ref(false)
const dragIndex = ref<number | null>(null)

function move(idx: number, dir: -1 | 1) {
  if (props.disabled || submitted.value) return
  const target = idx + dir
  if (target < 0 || target >= order.value.length) return
  const copy = [...order.value]
  ;[copy[idx], copy[target]] = [copy[target]!, copy[idx]!]
  order.value = copy
}

function onDragStart(idx: number) {
  dragIndex.value = idx
}
function onDrop(idx: number) {
  if (dragIndex.value === null || props.disabled || submitted.value) return
  const copy = [...order.value]
  const [moved] = copy.splice(dragIndex.value, 1)
  copy.splice(idx, 0, moved!)
  order.value = copy
  dragIndex.value = null
}

function submit() {
  if (props.disabled || submitted.value) return
  submitted.value = true
  emit('submit', order.value)
}
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-4">
    <p class="text-center text-sm font-medium text-slate-500">Drag or use the arrows to put items in order</p>
    <ul class="flex flex-col gap-2">
      <li
        v-for="(item, idx) in order"
        :key="item"
        class="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow ring-1 ring-slate-900/5"
        draggable="true"
        @dragstart="onDragStart(idx)"
        @dragover.prevent
        @drop="onDrop(idx)"
      >
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-display font-bold text-white">
          {{ idx + 1 }}
        </span>
        <span class="flex-1 font-semibold text-slate-800">{{ item }}</span>
        <div class="flex flex-col gap-0.5">
          <button
            type="button"
            class="btn-touch rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-30"
            :disabled="disabled || submitted || idx === 0"
            @click="move(idx, -1)"
          >
            ▲
          </button>
          <button
            type="button"
            class="btn-touch rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-30"
            :disabled="disabled || submitted || idx === order.length - 1"
            @click="move(idx, 1)"
          >
            ▼
          </button>
        </div>
      </li>
    </ul>
    <button
      type="button"
      class="btn-touch min-h-[64px] w-full rounded-2xl bg-indigo-600 text-xl font-display font-bold text-white shadow-lg disabled:opacity-50"
      :disabled="disabled || submitted"
      @click="submit"
    >
      Submit Order
    </button>
  </div>
</template>
