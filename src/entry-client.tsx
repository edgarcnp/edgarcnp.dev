// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

/** Mount the SolidStart client app. Throws if #app element is missing (SSR failure). */
const app = document.getElementById("app");
if (!app) {
  throw new Error("Missing required element: #app — SSR may have failed");
}

mount(() => <StartClient />, app);
