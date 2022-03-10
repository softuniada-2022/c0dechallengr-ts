<template>
  <h1 class="typewriter-heading --typewriter">
    <slot />
  </h1>
</template>

<style scoped>
@import "@/assets/animations.css";

.typewriter-heading::before {
  content: "$ ";
}
.typewriter-heading::after {
  content: "█";
  animation: flash 0.5s step-end infinite;
}
</style>
