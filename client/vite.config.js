import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://retail-price-comparison-bot.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false
  },
  define: {
    "process.env.VITE_API_URL": JSON.stringify(
      process.env.VITE_API_URL || "https://retail-price-comparison-bot.onrender.com"
    )
  }
});
