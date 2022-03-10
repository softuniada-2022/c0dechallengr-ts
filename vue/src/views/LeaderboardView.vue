<script setup lang="ts">
import { useUsers } from "@/api/user";
import ErrorCard from "../components/ErrorCard.vue";

const { data: users, error } = useUsers({
  sortBy: "score",
});
</script>

<template>
  <typewriter-heading>LEADERBOARD</typewriter-heading>
  <hr />
  <main>
    <ul v-if="users">
      <li class="leaderboard-entry" v-for="user in users" :key="user.username">
        <RouterLink :to="`/user/${user.username}`">{{
          user.username
        }}</RouterLink>
        ({{ user.score }} score)
      </li>
    </ul>
    <loading-card v-if="users === undefined && !error" />
    <ErrorCard v-if="error">Failed to load leaderboard: {{ error }}</ErrorCard>
  </main>
</template>

<style scoped>
.leaderboard-entry {
  /* numbered */
  list-style-type: decimal;
}
</style>
