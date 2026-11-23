import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // GitHub Pages serves the site from /<repo-name>/, so the workflow sets VITE_BASE
  base: process.env.VITE_BASE || "/",
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    coverage: {
      provider: "v8",
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/main.jsx", "src/firebase.js", "src/setupTests.js", "src/**/*.test.*"],
      thresholds: { lines: 70 },
    },
  },
});
