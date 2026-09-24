import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Rollup 4 (Vite 8) only supports the function form of manualChunks.
        manualChunks(id: string) {
          if (id.includes('three') || id.includes('@react-three')) return 'three-vendor'
          if (id.includes('recharts') || id.includes('d3-')) return 'charts-vendor'
          if (id.includes('framer-motion') || id.includes('motion')) return 'motion-vendor'
        },
      },
    },
  },
})
