<script setup lang="ts">
import { useExercises } from "@/api/exercise";
import ExerciseCard from "@/components/ExerciseCard.vue";
import ErrorCard from "../components/ErrorCard.vue";

const { data: exercises, error } = useExercises();
</script>

<template>
  <typewriter-heading>SOLVE</typewriter-heading>
  <hr />
  <main>
    <RouterLink to="/new-exercise"><button>New exercise</button></RouterLink>
    <section class="exercise-view" v-if="exercises">
      <article
        class="bordered-container"
        v-for="exercise in exercises"
        :key="exercise.id"
      >
        <ExerciseCard v-if="exercise" :exercise="exercise">
          <template #title="slotProps">
            <RouterLink :to="`/exercise/${exercise.id}`">
              {{ slotProps.title }}
            </RouterLink>
          </template>
          <template #description="slotProps">
            {{ slotProps.description.slice(0, 100) }}
            {{ slotProps.description.length > 100 ? "..." : "" }}
          </template>
        </ExerciseCard>
        <loading-card v-if="exercise === undefined && !error" />
        <ErrorCard v-if="error">Failed to load exercise: {{ error }}</ErrorCard>
      </article>
    </section>
    <loading-card v-if="exercises === undefined && !error" />
    <ErrorCard v-if="error">Failed to load exercises: {{ error }}</ErrorCard>
  </main>
</template>

<style scoped>
.exercise-view {
  margin-top: 2rem;
}

.exercise-view *:not(:last-child) {
  margin-bottom: 1rem;
}
</style>
