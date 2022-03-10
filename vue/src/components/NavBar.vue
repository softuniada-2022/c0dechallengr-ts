<script setup lang="ts">
import { useLogin, logOut } from "@/api/login";
import { RouterLink, useRouter } from "vue-router";

const $router = useRouter();

const { data: loginClaim } = useLogin();

function logout() {
  logOut();
  $router.push("/");
}
</script>

<template>
  <nav class="nav">
    <RouterLink class="nav__link" to="/">Home</RouterLink>
    <RouterLink class="nav__link" to="/exercises">Solve</RouterLink>
    <RouterLink class="nav__link" to="/leaderboard">Leaderboard</RouterLink>
    <a
      href=""
      class="nav__link --right"
      v-if="loginClaim"
      @click.prevent="logout"
    >
      Logout
    </a>
    <RouterLink
      v-if="loginClaim"
      class="nav__link --right"
      :to="`/user/${loginClaim.sub}`"
    >
      {{ loginClaim.sub }}
    </RouterLink>
    <RouterLink v-else class="nav__link --right" to="/login">Login</RouterLink>
  </nav>
</template>

<style scoped>
.nav {
  background-color: var(--c0-c-tertiary);
  overflow: hidden;
  border-radius: var(--c0-border-radius);
}

.nav__link {
  display: block;
  float: left;
  color: var(--c0-c-black);
  padding: var(--c0-button-padding);
  text-align: center;
  text-transform: uppercase;
}

.nav__link:hover {
  background-color: var(--c0-c-primary);
  color: var(--c0-c-white);
}

.--right {
  float: right;
}
</style>
