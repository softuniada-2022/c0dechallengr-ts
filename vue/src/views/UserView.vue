<script setup lang="ts">
import { useUser } from "@/api/user";
import { useRoute } from "vue-router";
import ErrorCard from "../components/ErrorCard.vue";

const $route = useRoute();
const username = $route.params.username as string;

const { data: user, error } = useUser(username);
</script>

<template>
  <main>
    <template v-if="user">
      <typewriter-heading>USER: {{ user.username }}</typewriter-heading>
      <hr />
      <dl class="user-dl --typewriter">
        <dt>Username</dt>
        <dd>{{ user.username }}</dd>
        <dt>Email</dt>
        <dd>{{ user.email }}</dd>
        <dt>Roles</dt>
        <dd v-if="user.roles">
          <ul>
            <li v-for="role in user.roles" :key="role">{{ role }}</li>
          </ul>
        </dd>
        <dt>Score</dt>
        <dd>{{ user.score }}</dd>
        <dt>Created</dt>
        <dd>{{ user.createdAt.replace("T", " ") }}</dd>
      </dl>
    </template>
    <loading-card v-if="user === undefined && !error" />
    <ErrorCard v-if="error">Failed to load exercises: {{ error }}</ErrorCard>
  </main>
</template>

<style scoped>
@import "@/assets/animations.css";

.user-dl dt {
  font-weight: bold;
}

.user-dl dt::before {
  content: "➜ ";
}

.user-dl dd {
  margin-bottom: 1em;
}
</style>
