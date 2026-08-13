import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Фронтендът вика /api на собствения си адрес, Vite препраща към Spring от
    // сървър към сървър — така CORS изобщо не влиза в играта. Бекендът пуска
    // само localhost:3000, а ние сме на 5173.
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
