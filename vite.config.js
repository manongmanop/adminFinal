import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const BACKEND = env.VITE_BACKEND || 'http://localhost:4000'

  const plugins = [react()]
  let useHttps = false
  try {
    const { default: mkcert } = await import('vite-plugin-mkcert')
    plugins.push(mkcert())
    useHttps = true
  } catch {
    console.warn('vite-plugin-mkcert not installed; using HTTP dev server')
  }

  return {
    plugins,
    server: {
      host: true,
      strictPort: false, // เปลี่ยนเป็น true ถ้าอยากล็อกพอร์ต
      https: useHttps,
      proxy: {
        '/api': {
          target: BACKEND,
          changeOrigin: true,
          secure: false, // สำคัญเมื่อ front เป็น https หรือ backend เป็น self-signed
        },
        '/uploads': {
          target: BACKEND,
          changeOrigin: true,
          secure: false,
        },
        // ใช้ /api/health ให้ตรงกับ backend
        '/api/health': {
          target: BACKEND,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
