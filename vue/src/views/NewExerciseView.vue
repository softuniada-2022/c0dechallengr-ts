<script setup lang="ts">
import { createExercise } from "@/api/exercise";
import { ref } from "vue";
import { useRouter } from "vue-router";

const $router = useRouter();

const name = ref("");
const description = ref(""); // textarea
const input = ref(""); // textarea
const answer = ref("");
const difficulty = ref(1); // 1-5

async function create() {
  const exId = await createExercise({
    name: name.value,
    description: description.value,
    input: input.value,
    answer: answer.value,
    difficulty: +difficulty.value, // +, because never trust no nobody
  });
  $router.push(`/exercise/${exId}`);
}
</script>

<template>
  <main>
    <typewriter-heading>NEW EXERCISE</typewriter-heading>
    <hr />
    <form @submit.prevent="create">
      <label for="name">
        <br />
        ➜ Name:
        <br />
      </label>
      <input
        type="text"
        id="name"
        v-model="name"
        minlength="4"
        maxlength="20"
      />
      <br />
      <label for="description">
        <br />
        ➜ Description:
        <br />
      </label>
      <textarea id="description" v-model="description" rows="5" minlength="10"></textarea>
      <br />
      <label for="input">
        <br />
        ➜ Input:
        <br />
      </label>
      <textarea id="input" v-model="input" rows="5" minlength="1"></textarea>
      <br />
      <label for="answer">
        <br />
        ➜ Answer:
        <br />
      </label>
      <input type="text" id="answer" v-model="answer" minlength="1" />
      <br />
      <label for="difficulty">
        <br />
        ➜ Difficulty:
      </label>
      <select id="difficulty" v-model="difficulty">
        <option :value="1">1</option>
        <option :value="2">2</option>
        <option :value="3">3</option>
        <option :value="4">4</option>
        <option :value="5">5</option>
      </select>
      <br />
      <br />
      <input type="submit" value="Create" />
    </form>
  </main>
</template>
