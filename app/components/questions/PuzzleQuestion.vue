<script setup lang="ts">
const props = defineProps<{ items: string[]; disabled?: boolean; retryToken?: number }>()
const emit = defineEmits<{ submit: [answer: string[]] }>()

const order = ref<string[]>([...props.items])
const submitted = ref(false)
const itemEls = ref<(HTMLLIElement | null)[]>([])

watch(
  () => props.retryToken,
  () => {
    submitted.value = false
  }
)

const dragIndex = ref<number | null>(null)
const dragOffsetY = ref(0)
let dragStartY = 0
let dragItemHeight = 0
let activePointerId: number | null = null

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function startDrag(e: PointerEvent, idx: number) {
  if (props.disabled || submitted.value) return
  if (e.pointerType === 'mouse' && e.button !== 0) return
  const el = itemEls.value[idx]
  if (!el) return

  e.preventDefault()
  dragIndex.value = idx
  dragOffsetY.value = 0
  dragStartY = e.clientY
  dragItemHeight = el.getBoundingClientRect().height
  activePointerId = e.pointerId

  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)
}

function onDragMove(e: PointerEvent) {
  if (dragIndex.value === null || e.pointerId !== activePointerId) return

  const delta = e.clientY - dragStartY
  const steps = dragItemHeight > 0 ? Math.round(delta / dragItemHeight) : 0

  if (steps !== 0) {
    const from = dragIndex.value
    const to = clamp(from + steps, 0, order.value.length - 1)
    if (to !== from) {
      const copy = [...order.value]
      const [moved] = copy.splice(from, 1)
      copy.splice(to, 0, moved!)
      order.value = copy
      dragIndex.value = to
      dragStartY += (to - from) * dragItemHeight
    }
  }

  dragOffsetY.value = e.clientY - dragStartY
}

function endDrag(e: PointerEvent) {
  if (e.pointerId !== activePointerId) return
  dragIndex.value = null
  dragOffsetY.value = 0
  activePointerId = null
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', endDrag)
  window.removeEventListener('pointercancel', endDrag)
}

function submit() {
  if (props.disabled || submitted.value) return
  submitted.value = true
  emit('submit', order.value)
}
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-4">
    <p class="text-center text-sm font-medium text-slate-500">Drag to put items in order</p>
    <ul class="flex flex-col gap-2">
      <li
        v-for="(item, idx) in order"
        :key="item"
        :ref="(el) => (itemEls[idx] = el as HTMLLIElement)"
        class="btn-touch flex touch-none select-none items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow ring-1 ring-slate-900/5"
        :class="[
          dragIndex === idx ? 'relative z-10 cursor-grabbing shadow-xl ring-2 ring-indigo-400' : 'cursor-grab',
          disabled || submitted ? 'cursor-default opacity-60' : ''
        ]"
        :style="dragIndex === idx ? { transform: `translateY(${dragOffsetY}px)`, transition: 'none' } : {}"
        @pointerdown="startDrag($event, idx)"
      >
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-display font-bold text-white">
          {{ idx + 1 }}
        </span>
        <span class="min-w-0 flex-1 break-words font-semibold text-slate-800">{{ item }}</span>
        <span class="shrink-0 text-lg text-slate-300" aria-hidden="true">⠿</span>
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
