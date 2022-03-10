<template>
  <h1 class="loading-heading">
    <slot>Loading</slot>
  </h1>
</template>

<style scoped>
@import "@/assets/animations.css";

.loading-heading {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  color: var(--c0-c-gray);
  opacity: 0.5;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.loading-heading::after {
  content: "";
  animation: three-dots 1s infinite;
}
</style>
