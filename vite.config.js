import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'http://10.198.200.52:8000'

// Make mkcert optional: use HTTPS if available, otherwise fallback to HTTP
export default defineConfig(async () => {
  const plugins = [react()]
  let useHttps = false

  try {
    const { default: mkcert } = await import('vite-plugin-mkcert')
    plugins.push(mkcert())
    useHttps = true
  } catch (e) {
    console.warn('vite-plugin-mkcert not installed; using HTTP dev server')
  }

  return {
    plugins,
    server: {
      host: true,
      https: useHttps,
      proxy: {
        '/api': { target: BACKEND, changeOrigin: true },
        '/uploads': { target: BACKEND, changeOrigin: true },
        '/health': { target: BACKEND, changeOrigin: true },
      },
    },
  }
})

