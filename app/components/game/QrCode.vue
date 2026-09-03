<script setup lang="ts">
import QRCode from 'qrcode'

const props = defineProps<{ value: string; size?: number }>()
const dataUrl = ref<string | null>(null)

async function render() {
  if (!props.value) {
    dataUrl.value = null
    return
  }
  dataUrl.value = await QRCode.toDataURL(props.value, {
    width: props.size ?? 240,
    margin: 1,
    color: { dark: '#1e1147', light: '#ffffff' }
  })
}

watch(() => props.value, render, { immediate: true })
</script>

<template>
  <img
    v-if="dataUrl"
    :src="dataUrl"
    alt="Join QR code"
    class="rounded-2xl bg-white p-2 shadow-md"
    :width="size ?? 240"
    :height="size ?? 240"
  />
</template>
