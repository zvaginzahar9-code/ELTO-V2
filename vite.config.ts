import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  build: {
    target: "es2022",
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("animejs") || id.includes("lenis")) return "motion";
            if (id.includes("react-router")) return "router";
            return "vendor";
          }
        },
      },
    },
  },
  server: { port: 5173, host: true },
});
