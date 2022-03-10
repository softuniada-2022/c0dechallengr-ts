<script setup lang="ts">
import { signUp } from "@/api/user";
import { ref } from "vue";
import { RouterLink } from "vue-router";

const username = ref("");
const email = ref("");
const password = ref("");

const showPassword = ref(false);

async function signup() {
  const u = username.value;
  const e = email.value;
  const p = password.value;
  await signUp(u, e, p);
  username.value = "";
  email.value = "";
  password.value = "";
}
</script>

<template>
  <typewriter-heading>SIGN UP</typewriter-heading>
  <hr />
  <main>
    <form @submit.prevent="signup">
      <label for="username">
        <br />
        ➜ Username:
        <br />
      </label>
      <input
        type="text"
        id="username"
        v-model="username"
        pattern="^[a-zA-Z][a-zA-Z0-9_]{3,12}$"
      />
      <br />
      <label for="email">
        <br />
        ➜ Email:
        <br />
      </label>
      <input type="email" id="email" v-model="email" />
      <br />
      <label for="password">
        <br />
        ➜ Password:
        <br />
      </label>
      <input
        :type="showPassword ? 'text' : 'password'"
        id="password"
        class="password-input"
        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,}$"
        v-model="password"
      />
      <br />
      <label for="showPassword">
        <input type="checkbox" v-model="showPassword" id="showPassword" />
        Show password
      </label>
      <br />
      <p>
        Already have an account?
        <RouterLink to="/login">Login</RouterLink>
      </p>
      <p>
        Share with a friend:
        <RouterLink to="/">c0dechallengr</RouterLink>
      </p>
      <input type="submit" value="Sign Up" />
    </form>
  </main>
</template>
