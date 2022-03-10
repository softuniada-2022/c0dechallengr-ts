import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/signup",
      name: "signup",
      component: () => import("../views/SignupView.vue"),
    },
    {
      path: "/leaderboard",
      name: "leaderboard",
      component: () => import("../views/LeaderboardView.vue"),
    },
    {
      path: "/exercises",
      name: "exercises",
      component: () => import("../views/ExercisesView.vue"),
    },
    {
      path: "/exercise/:id",
      name: "exercise",
      component: () => import("../views/ExerciseView.vue"),
    },
    {
      path: "/user/:username",
      name: "user",
      component: () => import("../views/UserView.vue"),
    },
    {
      path: "/new-exercise",
      name: "new-exercise",
      component: () => import("../views/NewExerciseView.vue"),
    },
    {
      path: "/:catchAll(.*)",
      name: "404",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});

export default router;
