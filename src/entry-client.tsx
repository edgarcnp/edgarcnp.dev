// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

const app = document.getElementById("app");
if (!app) {
  throw new Error("Missing required element: #app — SSR may have failed");
}

mount(() => <StartClient />, app);
