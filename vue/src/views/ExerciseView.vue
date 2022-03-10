<script setup lang="ts">
import ExerciseCard from "@/components/ExerciseCard.vue";
import { useRoute } from "vue-router";
import { useExercise } from "@/api/exercise";

const $route = useRoute();

const exerciseId = +$route.params.id;
const { data: exercise, error } = useExercise(exerciseId);
</script>

<template>
  <main>
    <ExerciseCard v-if="exercise" :exercise="exercise" :standalone="true">
      <template #title="slotProps">
        <typewriter-heading>SOLVE: {{ slotProps.title }}</typewriter-heading>
      </template>
      <template #description="slotProps">
        {{ slotProps.description }}
      </template>
    </ExerciseCard>
    <loading-card v-if="exercise === undefined && !error" />
    <ErrorCard v-if="error">Failed to load exercise: {{ error }}</ErrorCard>
  </main>
</template>
