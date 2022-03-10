<template>
  <div class="error-message">
    <h1><slot>Error</slot></h1>
    <p>
      <router-link to="/">Go back home</router-link>
    </p>
  </div>
</template>

<style scoped>
.error-message {
  text-align: center;
  justify-content: center;
  margin-top: 10rem;
  margin-bottom: 10rem;
}
</style>
