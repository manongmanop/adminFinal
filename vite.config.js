import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// BACKEND target: configurable via env, defaults to local API
// Use VITE_BACKEND in your environment or .env files

// Make mkcert optional: use HTTPS if available, otherwise fallback to HTTP
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const BACKEND = env.VITE_BACKEND || 'http://localhost:4000'
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
