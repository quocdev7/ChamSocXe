import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

/**
 * Cổng 5200 / backend 3041 — lệch hẳn BaoCaoSoDangBoApp (5190/3031) để chạy cùng lúc trên một máy.
 * Proxy `/api` khiến FE và BE cùng origin lúc dev, khỏi lo CORS.
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5200,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:3041', changeOrigin: true },
    },
  },
})
