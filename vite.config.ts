import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const isTauriDev = !!process.env.TAURI_ENV_PLATFORM;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: isTauriDev ? "chrome105" : "esnext",
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
