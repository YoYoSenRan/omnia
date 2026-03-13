import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5302,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3302',
        changeOrigin: true,
      },
    },
  },
})
