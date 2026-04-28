import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/amphi-session-lesira/',
  define: mode === 'test'
    ? {}
    : {
        Check: 'CheckCircle2',
      },
  test: {
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
}))
