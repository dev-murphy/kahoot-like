<script setup lang="ts">
const colors = ['#EF4444', '#3B82F6', '#EAB308', '#22C55E', '#A855F7', '#F97316', '#EC4899']
const pieces = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 0.6,
  duration: 2.2 + Math.random() * 1.6,
  color: colors[i % colors.length],
  rotate: Math.random() * 360,
  size: 6 + Math.random() * 6
}))
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
    <span
      v-for="p in pieces"
      :key="p.id"
      class="confetti-piece absolute top-[-5%] rounded-sm"
      :style="{
        left: p.left + '%',
        backgroundColor: p.color,
        width: p.size + 'px',
        height: p.size * 1.6 + 'px',
        animationDelay: p.delay + 's',
        animationDuration: p.duration + 's',
        transform: `rotate(${p.rotate}deg)`
      }"
    />
  </div>
</template>

<style scoped>
.confetti-piece {
  animation-name: confetti-fall;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation-fill-mode: forwards;
}
@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) rotate(540deg);
    opacity: 0.9;
  }
}
</style>
