import { createApp } from "vue";
import Toast from "vue-toastification";
import App from "./App.vue";
import TypewriterHeading from "./components/styled/TypewriterHeading.vue";
import LoadingCard from "./components/LoadingCard.vue";
import router from "./router";
import "vue-toastification/dist/index.css";

const app = createApp(App)
  .component("loading-card", LoadingCard)
  .component("typewriter-heading", TypewriterHeading);

app.use(router);
app.use(Toast);

app.mount("#app");
