<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import { ref } from "vue";
import { logIn } from "@/api/login";
import { useToast } from "vue-toastification";

const username = ref("");
const password = ref("");

const showPassword = ref(false);

const $router = useRouter();
const toast = useToast();

async function login() {
  const u = username.value;
  const p = password.value;
  try {
    await logIn(u, p);
    username.value = "";
    password.value = "";
    $router.push("/");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    toast.error("Login failed");
  }
}
</script>

<template>
  <typewriter-heading>LOGIN</typewriter-heading>
  <hr />
  <main>
    <form @submit.prevent="login">
      <label for="username">
        <br />
        ➜ Username:
        <br />
      </label>
      <input type="text" :id="username" v-model="username" minlength="3" />
      <br />
      <label for="password">
        <br />
        ➜ Password:
        <br />
      </label>
      <input
        :type="showPassword ? 'text' : 'password'"
        id="password"
        v-model="password"
        minlength="1"
      />
      <br />
      <label for="showPassword">
        <input type="checkbox" v-model="showPassword" id="showPassword" />
        Show password
      </label>
      <br />
      <p>
        Don't have an account?
        <RouterLink to="/signup">Sign Up</RouterLink>
      </p>
      <p>
        Share with a friend:
        <RouterLink to="/">c0dechallengr</RouterLink>
      </p>
      <input type="submit" value="Login" />
    </form>
  </main>
</template>
