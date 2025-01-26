import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { localesPlugin } from "./src/i18n/plugins/index.ts";

export default defineConfig({
  plugins: [react(), localesPlugin()],
  server: {
    proxy: {
      "/api": {
        target: "111",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
