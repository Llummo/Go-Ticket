import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'https://goticket-api.ddns.net',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
