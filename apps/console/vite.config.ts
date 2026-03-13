import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5301,
    strictPort: true,
    /* 代理 API 请求到 openclaw 服务 */
    proxy: {
      "/api": {
        target: "http://localhost:3301",
        changeOrigin: true,
      },
    },
  },
})
