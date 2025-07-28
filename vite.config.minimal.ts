import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Minimal config without SWC to avoid native binding issues
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});