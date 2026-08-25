import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The frontend calls /api on its own origin and Vite forwards to Spring
    // server-to-server, so CORS never comes into play.
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        configure: (proxy) => {
          // Browsers attach Origin to POST even for same-origin requests, and
          // the proxy passes it on. The backend allows only localhost:3174, so
          // Spring answers "Invalid CORS request". Dropping the header makes it
          // a plain server-to-server call. Remove once the backend allows 5173.
          proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
        },
      },
    },
  },
})
