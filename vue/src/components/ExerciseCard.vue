<script setup lang="ts">
import type Exercise from "@/models/Exercise";
import {
  prefetchLikes,
  prefetchLiked,
  likeExercise,
  unlikeExercise,
  useLikes,
  useLiked,
} from "@/api/exercise";
import { ref, toRefs } from "vue";
import { useLogin } from "@/api/login";
import {
  prefetchSolutions,
  useSolutions,
  submitSolution,
} from "@/api/solution";

const props = defineProps({
  exercise: {
    type: Object as () => Exercise,
    required: true,
  },
  standalone: {
    type: Boolean as () => boolean,
    default: false,
  },
});

const { exercise, standalone } = toRefs(props);

const { data: loginClaim } = useLogin();
const { data: solutions } = useSolutions(exercise.value.id);
const { data: liked } = useLiked(exercise.value.id);
const { data: likes } = useLikes(exercise.value.id);
const solved = !!solutions.value?.some((s) => s.correct);

const solution = ref("");
async function toggleLike() {
  if (!loginClaim.value) return;
  if (liked.value) {
    await unlikeExercise(exercise.value, likes.value ?? 0);
  } else {
    await likeExercise(exercise.value, likes.value ?? 0);
  }
}

async function solve() {
  if (!loginClaim.value) return;
  if (solution.value.length === 0) return;
  await submitSolution(exercise.value, {
    answer: solution.value,
  });
  solution.value = "";
  await prefetchSolutions(exercise.value.id);
}
</script>

<template>
  <div class="exercise-card">
    <header class="exercise-title">
      <slot name="title" :title="exercise.name">{{ exercise.name }}</slot>
    </header>
    <span class="exercise-description">
      <slot name="description" :description="exercise.description">{{
        exercise.description
      }}</slot>
    </span>
    <h3 v-if="!standalone && solved" class="--solved">Solved</h3>
    <template v-if="standalone">
      <form @submit.prevent="solve" v-if="!solved && loginClaim">
        <label for="solution">Solution:</label>
        <!-- eslint-disable-next-line prettier/prettier -->
        <input id="solution" type="text" v-model="solution" minlength="1" />
        <input type="submit" value="Solve" />
      </form>
      <h3 v-if="solved" class="--solved">Solved!</h3>
      <p v-if="!loginClaim" class="exercise-not-logged-in">
        You need to be
        <RouterLink to="/login">logged in</RouterLink>to solve exercises
      </p>

      <a class="button" :href="`/api/exercises/${exercise.id}/input`"
        >Get your input</a
      >

      <details v-if="loginClaim">
        <summary>Your solutions</summary>
        <ul v-if="solutions">
          <li v-for="attempt in solutions" :key="attempt.id">
            <span v-if="attempt.correct" class="green">✓</span>
            <span v-else class="red">✗</span>
            {{ attempt.answer }}
          </li>
        </ul>
      </details>
    </template>
    <hr />
    <footer class="exercise-footer">
      <a
        id="likeUnlike"
        class="exercise-likes"
        :class="liked && '--liked'"
        @mouseover="
          () =>
            prefetchLikes(exercise.id).then(() => prefetchLiked(exercise.id))
        "
        @click="toggleLike"
        >{{ likes }}
      </a>
      <span class="exercise-difficulty"
        >Difficulty: {{ exercise.difficulty }}</span
      >
    </footer>
  </div>
</template>

<style scoped>
.exercise-description {
  white-space: pre-wrap;
}
.exercise-title {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 0.5rem;
}

.exercise-likes,
.exercise-difficulty {
  font-weight: bold;
  color: var(--c0-c-secondary);
}

.exercise-likes:hover,
.exercise-difficulty:hover {
  text-decoration: underline;
  color: var(--c0-c-tertiary);
}
.exercise-likes::before {
  content: "❤️ ";
}

.--liked,
.--liked:hover {
  color: var(--c0-c-like);
}

.exercise-footer *:first-child {
  margin-right: 0.5rem;
}

.exercise-footer *:last-child {
  margin-left: 0.5rem;
}

.exercise-footer *:not(:first-child):not(:last-child) {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

.--solved::before {
  content: "✓ ";
}

.red {
  color: var(--c0-c-red);
}

.green {
  color: var(--c0-c-green);
}

.exercise-not-logged-in {
  text-decoration: underline;
}
</style>
