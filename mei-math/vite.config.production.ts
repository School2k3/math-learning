import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Make env variables available to the app
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
      process.env.VITE_API_BASE_URL || "http://localhost:3000"
    ),
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
